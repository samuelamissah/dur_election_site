
'use server'

import { createClient } from '../utils/supabase/server'
import { createServiceClient } from '../utils/supabase/serviceRole'
import { revalidatePath } from 'next/cache'

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function uploadStaffCsv(formData: FormData) {
  const file = formData.get('file') as File
  if (!file) {
    return { error: 'No file provided' }
  }

  const text = await file.text()
  const rows = text.split('\n').map(row => row.trim()).filter(Boolean)
  
  // Assume CSV header: staff_id, full_name, email
  // Skip header if present (simple check)
  const startIndex = rows[0].toLowerCase().includes('staff_id') ? 1 : 0
  
  const staffData = []
  
  for (let i = startIndex; i < rows.length; i++) {
    const [staffId, fullName, email] = rows[i].split(',').map(s => s.trim())
    if (staffId && email) {
      staffData.push({
        staff_id: staffId,
        full_name: fullName || null,
        email: email,
        has_voted: false
      })
    }
  }

  if (staffData.length === 0) {
    return { error: 'No valid data found in CSV' }
  }

  // Deduplicate staffData by staff_id to prevent Supabase error
  const uniqueStaffMap = new Map();
  staffData.forEach(staff => {
    uniqueStaffMap.set(staff.staff_id, staff);
  });
  const uniqueStaffData = Array.from(uniqueStaffMap.values());

  const supabase = createServiceClient()
  
  const { error } = await supabase
    .from('staff')
    .upsert(uniqueStaffData, { onConflict: 'staff_id' })

  if (error) {
    console.error('Supabase upload error:', error)
    return { error: 'Failed to upload staff data: ' + error.message }
  }

  // Send notifications to uploaded staff
  const results = await Promise.allSettled(
    uniqueStaffData.map(async (s) => {
      const emailRes = await sendConfirmationEmail(s.staff_id);
      return emailRes;
    })
  )
  const emailsSent = results.filter(r => r.status === 'fulfilled' && (r as PromiseFulfilledResult<any>).value?.success).length

  revalidatePath('/admin')
  return { success: true, count: uniqueStaffData.length, emailsSent }
}

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

  const supabase = createServiceClient()
 
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
  const supabase = createServiceClient()
  
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

export async function sendSmsNotification(staffId: string, phone: string) {
  // SMS Notification function removed as phone is no longer used
  return { success: true };
}

import nodemailer from 'nodemailer';

export async function sendConfirmationEmail(staffId: string) {
  const supabase = createServiceClient()
  
  // Fetch staff email and name
  const { data: staff, error } = await supabase
    .from('staff')
    .select('email, full_name')
    .eq('staff_id', staffId)
    .single()

  if (error || !staff || !staff.email) {
    console.error('Failed to find staff email:', error)
    return { error: 'Staff email not found' }
  }

  const staffName = staff.full_name || 'Staff Member';

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
    subject: 'Action Required: NECT Election 2026',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563EB;">National Engineering Coordinating Team Election 2026</h2>
        <p>Hello ${staffName},</p>
        <p>You have been registered as an eligible voter for the upcoming NECT election.</p>
        
        <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Voting Period:</strong>10th April 2026 (8:00AM - 5:00 PM)</p>
        </div>

        <p>Please use your Email Address to log in and cast your vote securely.</p>
        
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://dur-election-site.vercel.app/'}" style="display: inline-block; background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Go to Voting Portal
        </a>
        
        <p style="margin-top: 20px; font-size: 12px; color: #6B7280;">
          If you did not expect this email, please contact the election committee immediately.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${staff.email}`);
    // Update staff email status fields
    await supabase
      .from('staff')
      .update({ email_sent: true, email_last_sent_at: new Date().toISOString() })
      .eq('staff_id', staffId)
    return { success: true };
  } catch (emailError: any) {
    console.error('SMTP Error:', emailError);
    return { error: 'Failed to send email: ' + emailError.message };
  }
}

export async function getElectionStats() {
  const supabase = createServiceClient()

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

export async function getStaffList() {
  const supabase = createServiceClient()
  
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .order('created_at', { ascending: false })
    
  if (error) {
    console.error('Fetch staff error:', error)
    return []
  }
  
  return data
}
 
 export async function deleteStaff(staffId: string) {
   const supabase = createServiceClient()
 
   const { error } = await supabase
     .from('staff')
     .delete()
     .eq('staff_id', staffId)
 
   if (error) {
     console.error('Delete staff error:', error)
     return { error: 'Failed to delete staff: ' + error.message }
   }
 
   revalidatePath('/admin')
   return { success: true }
 }
 
 export async function deleteAllStaff() {
   const { createServiceClient } = await import('../utils/supabase/serviceRole')
   const supabaseSR = createServiceClient()
   
   // Delete votes first to satisfy foreign key constraint
   await supabaseSR.from('votes').delete().not('staff_id', 'is', null)
   
   const { error } = await supabaseSR.from('staff').delete().not('staff_id', 'is', null)
   if (error) {
     console.error('Delete all staff error:', error)
     return { error: 'Failed to delete all staff: ' + error.message }
   }
   revalidatePath('/admin')
   return { success: true }
 }
 
 export async function deleteAllCandidates() {
   const { createServiceClient } = await import('../utils/supabase/serviceRole')
   const supabaseSR = createServiceClient()

   // Delete votes first because candidates are referenced there
   await supabaseSR.from('votes').delete().not('candidate_id', 'is', null)
   
   const { error } = await supabaseSR.from('candidates').delete().not('name', 'is', null)
   if (error) {
     console.error('Delete all candidates error:', error)
     return { error: 'Failed to delete all candidates: ' + error.message }
   }
   revalidatePath('/admin')
   return { success: true }
 }

export async function sendThankYouEmail(staffId: string) {
  const supabase = createServiceClient()
  const { data: staff, error } = await supabase
    .from('staff')
    .select('email, full_name')
    .eq('staff_id', staffId)
    .single()
  if (error || !staff?.email) {
    return { error: 'Staff email not found' }
  }
  const staffName = staff.full_name || 'Staff Member';
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
  const mailOptions = {
    from: `"NECT Election Committee" <${process.env.SMTP_USER}>`,
    to: staff.email,
    subject: 'Thank You: Your Vote Has Been Recorded',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563EB;">Thank You for Voting</h2>
        <p>Hello ${staffName},</p>
        <p>Your vote has been recorded successfully for the NECT election.</p>
        <p style="margin-top: 12px; font-size: 12px; color: #6B7280;">If you have any concerns, contact the election committee.</p>
      </div>
    `,
  }
  try {
    await transporter.sendMail(mailOptions)
    await supabase
      .from('staff')
      .update({ thank_you_sent: true, thank_you_last_sent_at: new Date().toISOString() })
      .eq('staff_id', staffId)
    return { success: true }
  } catch (emailError: any) {
    return { error: 'Failed to send thank you email: ' + emailError.message }
  }
}
