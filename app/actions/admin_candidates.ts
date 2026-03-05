
'use server'

import { createClient } from '../utils/supabase/server'
import { revalidatePath } from 'next/cache'

// ... existing code ...

export async function uploadCandidatesCsv(formData: FormData) {
  const file = formData.get('file') as File
  if (!file) {
    return { error: 'No file provided' }
  }

  const text = await file.text()
  const rows = text.split('\n').map(row => row.trim()).filter(Boolean)
  
  // Header: name, position_slug, role, bio, image_url
  const startIndex = rows[0].toLowerCase().includes('position_slug') ? 1 : 0
  
  const candidatesData = []
  
  for (let i = startIndex; i < rows.length; i++) {
    // Handle CSV parsing carefully (simple split for now, robust parser recommended for production)
    const cols = rows[i].split(',')
    if (cols.length < 2) continue;

    const [name, position_slug, role, bio, image_url] = cols.map(s => s.trim())
    
    if (name && position_slug) {
      candidatesData.push({
        name,
        position_id: position_slug.toLowerCase(), // FK to positions(slug)
        role: role || '',
        bio: bio || '',
        image_url: image_url || ''
      })
    }
  }

  if (candidatesData.length === 0) {
    return { error: 'No valid candidate data found' }
  }

  const supabase = await createClient()
  
  // Verify positions exist first? 
  // For simplicity, we assume they do (seeded in SQL) or insert will fail with FK constraint
  
  const { error } = await supabase
    .from('candidates')
    .insert(candidatesData)

  if (error) {
    console.error('Candidate upload error:', error)
    return { error: 'Failed to upload candidates: ' + error.message }
  }

  revalidatePath('/admin')
  return { success: true, count: candidatesData.length }
}

export async function getDetailedResults() {
  const supabase = await createClient()
  
  // Get all positions
  const { data: positions } = await supabase
    .from('positions')
    .select('*')
    .order('display_order')

  if (!positions) return []

  // Get vote counts grouped by candidate
  // Since Supabase JS client doesn't support complex GROUP BY easily without views/RPC,
  // we'll fetch raw votes and aggregate in memory (fine for small scale < 1000 votes)
  // OR use .rpc() if we had a function.
  
  // Let's try a view approach or raw query? 
  // Simplest for prototype: Fetch all candidates and all votes.
  
  const { data: candidates } = await supabase.from('candidates').select('*')
  const { data: votes } = await supabase.from('votes').select('candidate_id, position_id')
  
  if (!candidates || !votes) return []

  // Aggregate
  const results = positions.map(pos => {
    const posCandidates = candidates.filter(c => c.position_id === pos.slug)
    
    const candidatesWithVotes = posCandidates.map(cand => {
      const count = votes.filter(v => v.candidate_id === cand.id).length // wait, candidate_id in votes table needs to match ID in candidates table
      // BUT, in our mock data/setup, we might be mixing IDs.
      // In db_candidates.sql, candidates have UUIDs.
      // In vote.ts, we insert whatever ID the frontend sent.
      // The frontend currently uses hardcoded IDs like 'c1', 'c2' from lib/data.ts
      
      // CRITICAL: We need to switch the frontend to use DB candidates instead of hardcoded data.ts
      // For now, let's assume the upload CSV will provide the IDs or we use names?
      // Actually, if we upload candidates to DB, they get new UUIDs.
      // The frontend needs to FETCH candidates from DB to display them.
      
      return {
        ...cand,
        voteCount: count
      }
    })
    
    return {
      ...pos,
      candidates: candidatesWithVotes
    }
  })
  
  return results
}
