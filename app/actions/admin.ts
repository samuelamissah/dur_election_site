
'use server'

import { createClient } from '../utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadStaffCsv(formData: FormData) {
  const file = formData.get('file') as File
  if (!file) {
    return { error: 'No file provided' }
  }

  const text = await file.text()
  const rows = text.split('\n').map(row => row.trim()).filter(Boolean)
  
  // Assume CSV header: staff_id, email
  // Skip header if present (simple check)
  const startIndex = rows[0].toLowerCase().includes('staff_id') ? 1 : 0
  
  const staffData = []
  
  for (let i = startIndex; i < rows.length; i++) {
    const [staffId, email] = rows[i].split(',').map(s => s.trim())
    if (staffId && email) {
      staffData.push({
        staff_id: staffId,
        email: email,
        has_voted: false
      })
    }
  }

  if (staffData.length === 0) {
    return { error: 'No valid data found in CSV' }
  }

  const supabase = await createClient()
  
  const { error } = await supabase
    .from('staff')
    .upsert(staffData, { onConflict: 'staff_id' })

  if (error) {
    console.error('Supabase upload error:', error)
    return { error: 'Failed to upload staff data: ' + error.message }
  }

  revalidatePath('/admin')
  return { success: true, count: staffData.length }
}

export async function sendConfirmationEmail(staffId: string) {
  // TODO: Integrate with an email provider (Resend, SendGrid, etc.)
  console.log(`Sending confirmation email to staff ${staffId}...`)
  
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return { success: true }
}

export async function getElectionStats() {
  const supabase = await createClient()

  // Fetch total staff
  const { count: totalStaff, error: staffError } = await supabase
    .from('staff')
    .select('*', { count: 'exact', head: true })

  // Fetch votes (distinct staff_id who voted)
  const { count: votesCast, error: votesError } = await supabase
    .from('staff')
    .select('*', { count: 'exact', head: true })
    .eq('has_voted', true)

  if (staffError || votesError) {
    console.error('Stats fetch error:', staffError || votesError)
    return null
  }

  return {
    totalStaff: totalStaff || 0,
    votesCast: votesCast || 0
  }
}
