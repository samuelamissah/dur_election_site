
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

  // Send emails to uploaded staff
  const results = await Promise.allSettled(
    staffData.map((s) => sendConfirmationEmail(s.staff_id))
  )
  const emailsSent = results.filter(r => r.status === 'fulfilled' && (r as PromiseFulfilledResult<any>).value?.success).length

  revalidatePath('/admin')
  return { success: true, count: staffData.length, emailsSent }
}

import nodemailer from 'nodemailer';

export async function sendConfirmationEmail(staffId: string) {
  const supabase = await createClient()
  
  // Fetch staff email
  const { data: staff, error } = await supabase
    .from('staff')
    .select('email')
    .eq('staff_id', staffId)
    .single()

  if (error || !staff || !staff.email) {
    console.error('Failed to find staff email:', error)
    return { error: 'Staff email not found' }
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"DUR Election Committee" <${process.env.SMTP_USER}>`,
    to: staff.email,
    subject: 'Action Required: DUR Staff Election 2026',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563EB;">Department of Urban Roads Staff Election 2026</h2>
        <p>Hello,</p>
        <p>You have been registered as an eligible voter for the upcoming staff election.</p>
        
        <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Staff ID:</strong> ${staffId}</p>
          <p><strong>Voting Period:</strong> March 10, 2026 - March 15, 2026 (5:00 PM)</p>
        </div>

        <p>Please use your Staff ID to log in and cast your vote securely.</p>
        
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}" style="display: inline-block; background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
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

export async function getStaffList() {
  const supabase = await createClient()
  
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
   const supabase = await createClient()
 
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
