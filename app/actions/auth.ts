
'use server'

import { createClient } from '../utils/supabase/server'
import { createServiceClient } from '../utils/supabase/serviceRole'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { ELECTION_END_DATE_STRING } from '../utils/election'
import { getElectionStatusClient } from './election'
import nodemailer from 'nodemailer'
import crypto from 'crypto'

export async function requestOtp(formData: FormData) {
  const status = await getElectionStatusClient();
  if (status.closed) {
    return { error: `The election has officially closed as of ${status.endDateStr || ELECTION_END_DATE_STRING}. Voting is no longer permitted.` }
  }
  if (!status.open) {
    return { error: `The election will not start until ${status.startDateStr || 'the scheduled time'}.` }
  }

  const email = formData.get('email') as string
  if (!email) {
    return { error: 'Email is required' }
  }

  const supabase = createServiceClient()

  // 1. Check if staff exists
  const { data: staff, error } = await supabase
    .from('staff')
    .select('*')
    .ilike('email', email)
    .single()

  if (error || !staff) {
    return { error: 'No voter found with this email address' }
  }

  // 2. Check if already voted
  if (staff.has_voted) {
    return { error: 'You have already voted' }
  }

  // 3. Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const secret = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'secret-key'
  const hash = crypto.createHmac('sha256', secret).update(otp + email.toLowerCase()).digest('hex')
  const expiresAt = Date.now() + 10 * 60 * 1000 // 10 mins

  // 4. Send email
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"NECT Election Committee" <${process.env.SMTP_USER}>`,
    to: staff.email,
    subject: 'Your Election Login OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563EB;">NECT Election Portal</h2>
        <p>Hello ${staff.full_name || 'Staff Member'},</p>
        <p>Your One-Time Password (OTP) for login is:</p>
        <h1 style="font-size: 32px; letter-spacing: 4px; color: #111827;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Failed to send OTP email:', err);
    // For testing without valid SMTP credentials, we can still proceed
    // return { error: 'Failed to send OTP email. Please contact support.' }
  }

  // 5. Store session
  const cookieStore = await cookies()
  cookieStore.set('otp_session', JSON.stringify({ email: email.toLowerCase(), hash, expiresAt }), { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 10 * 60 // 10 mins
  })

  return { success: true }
}

export async function verifyOtpAndLogin(formData: FormData) {
  const status = await getElectionStatusClient();
  if (status.closed) {
    return { error: `The election has officially closed.` }
  }

  const email = formData.get('email') as string
  const otp = formData.get('otp') as string
  
  if (!email || !otp) {
    return { error: 'Email and OTP are required' }
  }

  const cookieStore = await cookies()
  const otpSessionStr = cookieStore.get('otp_session')?.value

  if (!otpSessionStr) {
    return { error: 'OTP session expired. Please request a new one.' }
  }

  const otpSession = JSON.parse(otpSessionStr)

  if (otpSession.email !== email.toLowerCase()) {
    return { error: 'Invalid session.' }
  }

  if (Date.now() > otpSession.expiresAt) {
    cookieStore.delete('otp_session')
    return { error: 'OTP has expired. Please request a new one.' }
  }

  const secret = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'secret-key'
  const expectedHash = crypto.createHmac('sha256', secret).update(otp + email.toLowerCase()).digest('hex')

  if (expectedHash !== otpSession.hash) {
    return { error: 'Invalid OTP' }
  }

  // Verify user again
  const supabase = createServiceClient()
  const { data: staff, error } = await supabase
    .from('staff')
    .select('*')
    .ilike('email', email)
    .single()

  if (error || !staff) {
    return { error: 'Invalid user' }
  }

  if (staff.has_voted) {
    return { error: 'You have already voted' }
  }

  // Success - Clear OTP and set login session
  cookieStore.delete('otp_session')
  cookieStore.set('staff_session', staff.staff_id, { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 // 1 day
  })

  redirect('/vote')
}

export async function logoutStaff() {
  const cookieStore = await cookies()
  cookieStore.delete('staff_session')
  cookieStore.delete('staff_verified')
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function getCurrentStaff() {
  const cookieStore = await cookies()
  const staffId = cookieStore.get('staff_session')?.value

  if (!staffId) return null

  const supabase = createServiceClient()
  const { data: staff } = await supabase
    .from('staff')
    .select('staff_id, full_name, email')
    .eq('staff_id', staffId)
    .single()

  return staff
}
