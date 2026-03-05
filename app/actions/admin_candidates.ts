
'use server'

import { createClient } from '../utils/supabase/server'
import { revalidatePath } from 'next/cache'

/* eslint-disable @typescript-eslint/no-explicit-any */


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
 
  // Ensure required positions exist to satisfy FK constraint
  const { data: existingPositions, error: posFetchErr } = await supabase
    .from('positions')
    .select('slug')
 
  if (posFetchErr) {
    console.error('Positions fetch error:', posFetchErr)
    return { error: 'Failed to validate positions: ' + posFetchErr.message }
  }
 
  const existingSet = new Set<string>((existingPositions || []).map(p => p.slug))
  const neededSlugs = Array.from(new Set(candidatesData.map(c => c.position_id)))
  const missingSlugs = neededSlugs.filter(slug => !existingSet.has(slug))
 
  if (missingSlugs.length > 0) {
    return { 
      error: `Invalid positions found: ${missingSlugs.join(', ')}. Please ensure positions exist before uploading candidates.` 
    }
  }
  
  let { error } = await supabase.from('candidates').insert(candidatesData)
  if (error && error.code === 'PGRST205') {
    // Fallback if table is singular 'candidate'
    const fallback = await supabase.from('candidate').insert(candidatesData)
    error = fallback.error || null as any
  }

  if (error) {
    console.error('Candidate upload error:', error)
    return { error: 'Failed to upload candidates: ' + error.message }
  }

  revalidatePath('/admin')
  return { success: true, count: candidatesData.length }
}

export async function getCandidatesList() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('candidates')
    .select('*, positions(title)')
    .order('created_at', { ascending: false })
    
  if (error) {
    console.error('Fetch candidates error:', error)
    return []
  }
  
  return data
}

export async function deleteCandidate(candidateId: string) {
  const { createServiceClient } = await import('../utils/supabase/serviceRole')
  const supabaseSR = createServiceClient()

  // Delete votes first because candidate is referenced there
  await supabaseSR.from('votes').delete().eq('candidate_id', candidateId)
  
  const { error } = await supabaseSR.from('candidates').delete().eq('id', candidateId)
  
  if (error) {
    console.error('Delete candidate error:', error)
    return { error: 'Failed to delete candidate: ' + error.message }
  }

  revalidatePath('/admin')
  return { success: true }
}
 
 export async function deletePosition(slug: string) {
  const supabase = await createClient()
  await supabase.from('votes').delete().eq('position_id', slug)
  await supabase.from('candidates').delete().eq('position_id', slug)
  const { error } = await supabase.from('positions').delete().eq('slug', slug)
  if (error) {
    return { error: 'Failed to delete position: ' + error.message }
  }
  revalidatePath('/admin')
  return { success: true }
 }

export async function deleteAllPositions() {
  const { createServiceClient } = await import('../utils/supabase/serviceRole')
  const supabaseSR = createServiceClient()
  
  // Cascade delete everything
  await supabaseSR.from('votes').delete().not('id', 'is', null)
  await supabaseSR.from('candidates').delete().not('id', 'is', null)
  const { error } = await supabaseSR.from('positions').delete().not('slug', 'is', null)
  
  if (error) {
    console.error('Delete all positions error:', error)
    return { error: 'Failed to reset positions: ' + error.message }
  }
  
  revalidatePath('/admin')
  return { success: true }
}

export async function seedDefaultPositions() {
  const supabase = await createClient()
  const defaults = [
    { slug: 'chairman', title: 'Chairman', description: 'Responsible for leading the committee and overseeing all operations.', display_order: 1 },
    { slug: 'vice-chairman', title: 'Vice Chairman', description: 'Supports the Chairman and steps in when necessary.', display_order: 2 },
    { slug: 'treasurer', title: 'Treasurer', description: 'Manages the financial assets and records of the organization.', display_order: 3 },
    { slug: 'secretary', title: 'Secretary', description: 'Maintains records, minutes, and correspondence.', display_order: 4 },
    { slug: 'organiser', title: 'Organiser', description: 'Responsible for organizing events and mobilizing members.', display_order: 5 },
  ]
  
  const { error } = await supabase.from('positions').upsert(defaults, { onConflict: 'slug' })
  if (error) {
    console.error('Seed positions error:', error)
    return { error: 'Failed to seed positions: ' + error.message }
  }
  revalidatePath('/admin')
  return { success: true }
}

export async function getDetailedResults() {
  const supabase = await createClient()
  const { createServiceClient } = await import('../utils/supabase/serviceRole')
  const supabaseSR = createServiceClient()
  
  const { data: positions } = await supabase
    .from('positions')
    .select('slug,title,description,display_order')
    .order('display_order')
  if (!positions) return []
  
  const { data: candidates } = await supabase
    .from('candidates')
    .select('id,name,role,bio,image_url,position_id')
  
  // Direct aggregation from votes table using Service Role to bypass RLS and avoid stale views
  const { data: votes, error: votesError } = await supabaseSR
    .from('votes')
    .select('candidate_id,position_id')
  
  if (votesError) {
    console.error('Failed to fetch raw votes:', votesError)
  }
  
  const countMap = new Map<string, number>()
  ;(votes || []).forEach(v => {
    const key = `${v.position_id}:${v.candidate_id}`
    countMap.set(key, (countMap.get(key) || 0) + 1)
  })
  
  return positions.map((pos: any) => {
    const posCandidates = (candidates || []).filter((c: any) => c.position_id === pos.slug)
    const candidatesWithVotes = posCandidates.map((cand: any) => {
      const voteCount = countMap.get(`${pos.slug}:${cand.id}`) || 0
      return { ...cand, voteCount }
    })
    return { ...pos, candidates: candidatesWithVotes }
  })
}
