import LeaderboardTable from '@/components/leaderboard/leaderboard-table';
import data from "@/lib/leaderboard.json"
import { Shiny } from '@/lib/types';

// Helper function to calculate score based on arbitrary rules
const calculateScore = (shinies: Shiny[]): number => {
  return shinies.reduce((total, shiny) => {
    let points = 10; // Base points per shiny
    if (shiny.modifiers.secret) points += 50;
    if (shiny.modifiers.alpha) points += 25;
    if (shiny.modifiers.safari) points += 15;
    return total + points;
  }, 0);
};

export default function Home() {
  return (
    <main className="min-h-screen bg-black p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl space-y-6">
        <header className="space-y-2 mb-8 text-center sm:text-left border-b-2 border-emerald-900 pb-4">
          <h1 className="text-3xl font-mono font-bold text-emerald-400 tracking-tight uppercase">
            &gt; Team_PokéMafia
          </h1>
        </header>

        <LeaderboardTable players={data.players} />
      </div>
    </main>
  );
}
