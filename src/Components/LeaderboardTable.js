import { Link } from 'react-router-dom';

export default function LeaderboardTable({ participants = [] }) {
  const calculateAverage = (participant) => {
    if (!participant?.averageSteps) return '-';
    return participant.averageSteps.toLocaleString();
  };

  const getYesterdaySteps = (participant) => {
    if (!participant?.dailySteps) return '-';
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];
    const steps = participant.dailySteps?.[dateStr];
    return steps ? steps.toLocaleString() : '-';
  };

  const getParticipantStatus = (participant) => {
    if (!participant?.dailySteps) return null;
    
    // Set target based on participant name
    const targetSteps = participant.name.toLowerCase() === 'thiruvai' ? 7000 : 10000;
    
    // Only count days that have actual data (not future dates with 0)
    const daysBelow = Object.entries(participant.dailySteps)
      .filter(([date, steps]) => {
        // Only consider days with actual step data (non-zero)
        return steps !== 0 && steps !== null && steps < targetSteps;
      })
      .length;

    // Early return for Thiruvai with custom messaging
    if (participant.name.toLowerCase() === 'thiruvai') {
      if (daysBelow > 2) {
        return <span className="ml-2 text-xs px-2 py-1 bg-red-900/50 text-red-400 rounded">Disqualified (7k)</span>;
      } else if (daysBelow === 2) {
        return <span className="ml-2 text-xs px-2 py-1 bg-orange-900/50 text-orange-400 rounded">Insufficient steps (7k)</span>;
      } else if (daysBelow === 1) {
        return <span className="ml-2 text-xs px-2 py-1 bg-yellow-900/50 text-yellow-400 rounded">&lt;7k</span>;
      }
      return null;
    }

    // Standard 10k logic for everyone else
    if (daysBelow > 2) {
      return <span className="ml-2 text-xs px-2 py-1 bg-red-900/50 text-red-400 rounded">Disqualified</span>;
    } else if (daysBelow === 2) {
      return <span className="ml-2 text-xs px-2 py-1 bg-orange-900/50 text-orange-400 rounded">Insufficient steps</span>;
    } else if (daysBelow === 1) {
      return <span className="ml-2 text-xs px-2 py-1 bg-yellow-900/50 text-yellow-400 rounded">&lt;10k</span>;
    }
    return null;
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-6">
      <h2 className="text-lg font-semibold mb-6">Leaderboard</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-slate-700">
              <th className="pb-4 pl-4">Rank</th>
              <th className="pb-4">Name</th>
              <th className="pb-4 text-right">Total Steps</th>
              <th className="pb-4 text-right">Rolling Average</th>
              <th className="pb-4 text-right pr-4">Yesterday</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((participant, index) => (
              <tr
                key={participant.name ?? index}
                className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors cursor-pointer"
              >
                <td className="py-4 pl-4">
                  <div className="flex items-center gap-2">
                    {index + 1}
                    {index === 0 && <span className="text-yellow-400">👑</span>}
                  </div>
                </td>
                <td className="py-4">
                  <Link 
                    to={`/${participant.name?.toLowerCase() ?? ''}`} 
                    className="no-underline text-inherit hover:text-cyan-400 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center">
                        <span className="text-sm font-semibold text-cyan-400">
                          {participant.name?.charAt(0).toUpperCase() ?? '?'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">
                          {participant.name 
                            ? participant.name.charAt(0).toUpperCase() + participant.name.slice(1)
                            : 'Unknown'}
                        </span>
                        {getParticipantStatus(participant)}
                      </div>
                    </div>
                  </Link>
                </td>
                <td className="py-4 text-right">
                  {participant.totalSteps?.toLocaleString() ?? '-'}
                </td>
                <td className="py-4 text-right">{calculateAverage(participant)}</td>
                <td className="py-4 text-right pr-4">
                  {getYesterdaySteps(participant)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}