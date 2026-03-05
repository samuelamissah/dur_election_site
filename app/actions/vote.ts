
'use server'

import { createClient } from '../utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function submitVote(selections: Record<string, string>) {
  const cookieStore = await cookies()
  const staffId = cookieStore.get('staff_session')?.value

  if (!staffId) {
    return { error: 'Unauthorized: No active session' }
  }

  // Transform selections object into array
  const votesArray = Object.entries(selections).map(([positionId, candidateId]) => ({
    position_id: positionId,
    candidate_id: candidateId
  }))

  if (votesArray.length === 0) {
    return { error: 'No selections submitted' }
  }

  const supabase = await createClient()

  // Try RPC first (best: true transaction)
  const { error: rpcError } = await supabase.rpc('submit_ballot', {
    p_staff_id: staffId,
    p_votes: votesArray
  })

  if (rpcError) {
    console.error('Vote submission error:', rpcError)
    // If RPC missing, perform safe fallback
    if (
      rpcError.message.includes('Could not find the function') ||
      rpcError.code === 'PGRST202'
    ) {
      // Fallback flow:
      // 1) Mark staff as voted only if not voted yet
      const { data: updated, error: updateErr } = await supabase
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

      // 2) Insert votes
      const voteRecords = votesArray.map(v => ({
        staff_id: staffId,
        position_id: v.position_id,
        candidate_id: v.candidate_id,
      }))

      const { error: insertErr } = await supabase
        .from('votes')
        .insert(voteRecords)

      if (insertErr) {
        console.error('Fallback insert votes error:', insertErr)
        // rollback staff flag if insert failed
        await supabase.from('staff').update({ has_voted: false }).eq('staff_id', staffId)
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
  return { success: true }
}
