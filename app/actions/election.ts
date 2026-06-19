'use server'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from '../utils/supabase/server';
import { createServiceClient } from '../utils/supabase/serviceRole';
import { ELECTION_END_DATE, ELECTION_START_DATE } from '../utils/election';

export async function getElectionStatusOverrides(): Promise<{ status: 'open' | 'closed' | 'auto' }> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from('system_settings').select('value').eq('key', 'election_status').single();
    if (data && data.value) {
      let val = data.value as string;
      if (typeof val === 'string') val = val.replace(/['"]/g, '');
      return { status: val as any };
    }
  } catch (e) {
    // ignore
  }
  return { status: 'auto' };
}

export async function isElectionClosed(): Promise<boolean> {
  const overrides = await getElectionStatusOverrides();
  if (overrides.status === 'closed') return true;
  if (overrides.status === 'open') return false;
  return new Date() >= ELECTION_END_DATE;
}

export async function isElectionOpen(): Promise<boolean> {
  const overrides = await getElectionStatusOverrides();
  if (overrides.status === 'closed') return false;
  if (overrides.status === 'open') return true;
  return new Date() >= ELECTION_START_DATE && !(await isElectionClosed());
}

export async function getElectionStatusClient(): Promise<{ closed: boolean, open: boolean }> {
  const closed = await isElectionClosed();
  const open = await isElectionOpen();
  return { closed, open };
}

export async function setElectionStatusOverride(status: 'open' | 'closed' | 'auto') {
  const supabase = createServiceClient();
  const { error } = await supabase.from('system_settings').upsert({
    key: 'election_status',
    value: `"${status}"` // Store as valid JSON string
  });
  if (error) {
    console.error("setElectionStatusOverride error:", error);
    return { error: error.message };
  }
  return { success: true };
}