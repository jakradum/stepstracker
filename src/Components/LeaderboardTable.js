import { Link } from 'react-router-dom';

export default function LeaderboardTable({ 
  participants = [], 
  specialTargets = [], 
  defaultTarget = 10000,
  dateRange = { start: '', end: '' }  // Added dateRange prop
}) {
  const calculateAverage = (participant) => {
    if (!participant?.averageSteps) return '-';
    return participant.averageSteps.toLocaleString();
  };

  const getYesterdaySteps = (participant) => {
    if (!participant?.dailySteps) return '-';
    
    // Get all dates with non-zero steps
    const datesWithSteps = Object.entries(participant.dailySteps)
      .filter(([_, steps]) => steps > 0)
      .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA));

    if (datesWithSteps.length > 0) {
      const [_, steps] = datesWithSteps[0];
      return steps.toLocaleString();
    }
    return '-';
  };
  const getChallengeDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };
  
  const getParticipantTarget = (participant, date) => {
    const special = specialTargets.find(t => t.name.toLowerCase() === participant.name.toLowerCase());
    
    if (!special) return defaultTarget;
  
    // Calculate if within special period
    const totalDays = getChallengeDuration(dateRange.start, dateRange.end);
    const specialDays = Math.ceil((special.duration / 100) * totalDays);
    
    if (!date) return special.target;
  
    const start = new Date(dateRange.start);
    const current = new Date(date);
    start.setHours(0, 0, 0, 0);
    current.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((current - start) / (1000 * 60 * 60 * 24));
    return daysDiff < specialDays ? special.target : defaultTarget;
  };

  const calculateGoalPercentage = (participant) => {
    const targetSteps = getParticipantTarget(participant);
    const percentage = (participant.averageSteps / targetSteps) * 100;
    return percentage;
  };

  const hasSpecialTarget = (participant) => {
    return specialTargets.some(t => t.name.toLowerCase() === participant.name.toLowerCase());
  };


  const getParticipantStatus = (participant) => {
    if (!participant?.dailySteps) return null;
    
    const special = specialTargets.find(t => t.name.toLowerCase() === participant.name.toLowerCase());
    const targetSteps = special ? special.target : defaultTarget;
    
    // Count days below target
    const daysBelow = Object.entries(participant.dailySteps)
      .filter(([date, steps]) => {
        // Only count days with actual data (non-zero)
        if (steps === 0 || steps === null) return false;
        
        // Debug log
        console.log(`Checking ${participant.name} for ${date}:`);
        console.log(`Steps: ${steps}, Target: ${targetSteps}`);
        console.log(`Below target: ${steps < targetSteps}`);
        
        return steps < targetSteps;
      })
      .length;
  

    console.log(`${participant.name} has ${daysBelow} days below target`);
  
    const suffix = special ? ` (${targetSteps/1000}k)` : '';
  
    if (daysBelow > 2) {
      return <span className="ml-2 text-xs px-2 py-1 bg-red-900/50 text-red-400 rounded">Disqualified{suffix}</span>;
    } else if (daysBelow === 2) {
      return <span className="ml-2 text-xs px-2 py-1 bg-orange-900/50 text-orange-400 rounded">Insufficient steps{suffix}</span>;
    } else if (daysBelow === 1) {
      return <span className="ml-2 text-xs px-2 py-1 bg-yellow-900/50 text-yellow-400 rounded">&lt;{targetSteps/1000}k</span>;
    }
    return null;
  };

  const sortedParticipants = [...participants].sort((a, b) => calculateGoalPercentage(b) - calculateGoalPercentage(a));

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
              <th className="pb-4 text-right">Daily Average</th>
              <th className="pb-4 text-right">Goal Achievement</th>
              <th className="pb-4 text-right pr-4">Yesterday</th>
            </tr>
          </thead>
          <tbody>
            {sortedParticipants.map((participant, index) => (
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
                          {hasSpecialTarget(participant) && <span className="ml-1">⭐</span>}
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
                <td className="py-4 text-right">
                  <span className={`${
                    calculateGoalPercentage(participant) >= 100 
                      ? 'text-green-400' 
                      : calculateGoalPercentage(participant) >= 90 
                        ? 'text-yellow-400' 
                        : 'text-gray-400'
                  }`}>
                    {calculateGoalPercentage(participant).toFixed(1)}%
                  </span>
                </td>
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