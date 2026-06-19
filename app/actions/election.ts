'use server'

import { createClient } from '../utils/supabase/server';
import { createServiceClient } from '../utils/supabase/serviceRole';
import { ELECTION_END_DATE, ELECTION_START_DATE } from '../utils/election';

export async function getElectionSettings() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from('system_settings').select('key, value').in('key', ['election_status', 'election_start_date', 'election_end_date']);
    
    let status = 'auto';
    let startDate = ELECTION_START_DATE.toISOString();
    let endDate = ELECTION_END_DATE.toISOString();

    if (data) {
      data.forEach(row => {
        let val = row.value as string;
        if (typeof val === 'string') val = val.replace(/['"]/g, '');
        if (row.key === 'election_status') status = val;
        if (row.key === 'election_start_date' && val) startDate = val;
        if (row.key === 'election_end_date' && val) endDate = val;
      });
    }
    return { status: status as 'open'|'closed'|'auto', startDate, endDate };
  } catch (e) {
    return { status: 'auto' as const, startDate: ELECTION_START_DATE.toISOString(), endDate: ELECTION_END_DATE.toISOString() };
  }
}

export async function isElectionClosed(): Promise<boolean> {
  const settings = await getElectionSettings();
  if (settings.status === 'closed') return true;
  if (settings.status === 'open') return false;
  return new Date() >= new Date(settings.endDate);
}

export async function isElectionOpen(): Promise<boolean> {
  const settings = await getElectionSettings();
  if (settings.status === 'closed') return false;
  if (settings.status === 'open') return true;
  return new Date() >= new Date(settings.startDate) && !(await isElectionClosed());
}

function formatDate(isoString: string) {
  try {
    return new Date(isoString).toLocaleString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric', 
      hour: 'numeric', minute: '2-digit', timeZoneName: 'short'
    });
  } catch {
    return isoString;
  }
}

export async function getElectionStatusClient() {
  const settings = await getElectionSettings();
  const closed = await isElectionClosed();
  const open = await isElectionOpen();
  return { 
    closed, 
    open, 
    status: settings.status,
    startDate: settings.startDate, 
    endDate: settings.endDate,
    startDateStr: formatDate(settings.startDate),
    endDateStr: formatDate(settings.endDate)
  };
}

export async function setElectionSettings(status: 'open' | 'closed' | 'auto', startDate?: string, endDate?: string) {
  const supabase = createServiceClient();
  const updates = [
    { key: 'election_status', value: `"${status}"` }
  ];
  if (startDate) updates.push({ key: 'election_start_date', value: `"${startDate}"` });
  if (endDate) updates.push({ key: 'election_end_date', value: `"${endDate}"` });

  const { error } = await supabase.from('system_settings').upsert(updates);
  if (error) {
    console.error("setElectionSettings error:", error);
    return { error: error.message };
  }
  return { success: true };
}