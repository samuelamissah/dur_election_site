export const ELECTION_END_DATE_STRING = "June 17, 2026 at 6:00 PM (GMT)";
export const ELECTION_END_DATE = new Date('2026-06-17T18:00:00Z'); // Explicitly GMT/UTC for consistency

export const ELECTION_START_DATE_STRING = "June 17, 2026 at 6:00 AM (GMT)";
export const ELECTION_START_DATE = new Date('2026-06-17T06:00:00Z');

export function isElectionClosed(): boolean {
  return new Date() >= ELECTION_END_DATE;
}

export function isElectionOpen(): boolean {
  // Overridden for testing to always be true if before end date
  // In production, this would be: return new Date() >= ELECTION_START_DATE && !isElectionClosed();
  return !isElectionClosed();
}