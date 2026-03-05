
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

  // Transform selections object into array for RPC
  const votesArray = Object.entries(selections).map(([positionId, candidateId]) => ({
    position_id: positionId,
    candidate_id: candidateId
  }))

  if (votesArray.length === 0) {
    return { error: 'No selections submitted' }
  }

  const supabase = await createClient()

  // Use the RPC function `submit_ballot` for atomic transaction
  const { error: rpcError } = await supabase.rpc('submit_ballot', {
    p_staff_id: staffId,
    p_votes: votesArray
  })

  if (rpcError) {
    console.error('Vote submission error:', rpcError)
    // Map common errors
    if (rpcError.message.includes('already voted')) {
      return { error: 'You have already voted!' }
    }
    return { error: 'Vote submission failed. Please try again or contact support.' }
  }

  // Success!
  return { success: true }
}
