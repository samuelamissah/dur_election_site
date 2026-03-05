
'use server'

import { createClient } from '../utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function loginWithStaffId(formData: FormData) {
  const staffId = formData.get('staffId') as string
  
  if (!staffId) {
    return { error: 'Staff ID is required' }
  }

  const supabase = await createClient()

  // 1. Check if staff exists
  const { data: staff, error } = await supabase
    .from('staff')
    .select('*')
    .eq('staff_id', staffId)
    .single()

  if (error || !staff) {
    return { error: 'Invalid Staff ID' }
  }

  // 2. Check if already voted
  if (staff.has_voted) {
    return { error: 'You have already voted' }
  }

  // 3. Create a session (simple cookie for now, as we don't have password auth)
  // In a real app with Supabase Auth, we might use passwordless sign-in (OTP) here.
  // For this "Staff ID Login" requirement, we'll set a secure cookie manually
  // or use a custom claim if we were using anonymous auth.
  
  // Security Note: This is a weak form of auth (just knowing the ID). 
  // Ideally, we should send an OTP to the staff.email found in DB.
  // But per Phase 3 requirements ("Staff ID login"), we proceed with this.
  
  const cookieStore = await cookies()
  cookieStore.set('staff_session', staffId, { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 // 1 day
  })

  redirect('/vote')
}

export async function logoutStaff() {
  const cookieStore = await cookies()
  cookieStore.delete('staff_session')
  redirect('/')
}
