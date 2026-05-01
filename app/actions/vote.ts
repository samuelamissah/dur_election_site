
'use server'

import { createClient } from '../utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServiceClient } from '../utils/supabase/serviceRole'
import { sendThankYouEmail } from './admin'
import { isElectionClosed, ELECTION_END_DATE_STRING } from '../utils/election'

export async function submitVote(selections: Record<string, string>) {
  if (isElectionClosed()) {
    return { error: `Election closed on ${ELECTION_END_DATE_STRING}. Votes can no longer be submitted.` }
  }

  const cookieStore = await cookies()
  const staffId = cookieStore.get('staff_session')?.value

  if (!staffId) {
    return { error: 'Unauthorized: No active session' }
  }

  // Transform selections object into array, filtering out "NO_VOTE" selections
  const votesArray = Object.entries(selections)
    .filter(([_, candidateId]) => candidateId !== 'NO_VOTE')
    .map(([positionId, candidateId]) => ({
      position_id: positionId,
      candidate_id: candidateId
     }))
 
  if (Object.keys(selections).length === 0) {
    return { error: 'No selections submitted' }
  }
 
  const supabase = await createClient()

  // Security: Verify that candidates actually belong to the positions being voted for
  const { data: validCandidates } = await supabase
    .from('candidates')
    .select('id, position_id')
    .in('id', votesArray.map(v => v.candidate_id))

  for (const vote of votesArray) {
    const isValid = validCandidates?.some(c => c.id === vote.candidate_id && c.position_id === vote.position_id)
    if (!isValid) {
      return { error: 'Security Alert: Invalid candidate selection detected.' }
    }
  }

  // Success!
  const refId = 'NECT-' + Math.random().toString(36).substring(2, 9).toUpperCase()

  // Try RPC first (best: true transaction)
  const { error: rpcError } = await supabase.rpc('submit_ballot', {
    p_staff_id: staffId,
    p_votes: votesArray
  })

  if (rpcError) {
    // If RPC missing, perform safe fallback
    if (
      rpcError.message?.includes('Could not find the function') ||
      rpcError.code === 'PGRST202'
    ) {
      console.warn('RPC submit_ballot missing (PGRST202). Using fallback vote submission flow...');
      // Fallback flow:
      const supabaseSR = createServiceClient()
      const { data: updated, error: updateErr } = await supabaseSR
        .from('staff')
        .update({ has_voted: true })
        .eq('staff_id', staffId)
        .eq('has_voted', false)
        .select('staff_id')

      if (updateErr) {
        console.error('Fallback update error:', updateErr)
        return { error: 'Vote submission failed. Please try again or contact support.' }
      }

      if (!updated || updated.length === 0) {
        return { error: 'You have already voted!' }
      }

      const voteRecords = votesArray.map(v => ({
        staff_id: staffId,
        position_id: v.position_id,
        candidate_id: v.candidate_id,
      }))

      const { error: insertErr } = await supabaseSR
        .from('votes')
        .insert(voteRecords)

      if (insertErr) {
        console.error('Fallback insert votes error:', insertErr)
        // rollback staff flag if insert failed
        await supabaseSR.from('staff').update({ has_voted: false }).eq('staff_id', staffId)
        return { error: 'Vote submission failed. Please try again or contact support.' }
      }
    } else {
      // Map common errors via RPC
      if (rpcError.message.includes('already voted')) {
        return { error: 'You have already voted!' }
      }
      return { error: 'Vote submission failed. Please try again or contact support.' }
    }
  }

  // Success!
  await sendThankYouEmail(staffId)

  // Fetch staff name to return it to the success page
  const supabaseSR = createServiceClient()
  const { data: staff } = await supabaseSR
    .from('staff')
    .select('full_name')
    .eq('staff_id', staffId)
    .single()

  const staffName = staff?.full_name || staffId;

  return { success: true, refId, staffName }
}
