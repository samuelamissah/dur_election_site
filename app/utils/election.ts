export const ELECTION_END_DATE_STRING = "April 10, 2026 at 4:00 PM (GMT)";
export const ELECTION_END_DATE = new Date('2026-04-10T16:00:00Z'); // Explicitly GMT/UTC for consistency

export function isElectionClosed(): boolean {
  return new Date() >= ELECTION_END_DATE;
}