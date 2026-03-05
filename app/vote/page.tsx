
import VotingDashboard from '../components/VotingDashboard';
import ElectionBanner from '../components/ElectionBanner';

export default function VotePage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans antialiased">
      <ElectionBanner />
      <main className="container mx-auto py-8">
        <h1 className="text-2xl font-bold text-center mb-8 sr-only">Voting Dashboard</h1>
        <VotingDashboard />
      </main>
    </div>
  );
}
