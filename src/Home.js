//file name Home.js (in src folder)
import { Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import LeaderboardTable from './Components/LeaderboardTable';

export default function Home() {
 const [isLoading, setIsLoading] = useState(true);
 const [leaderboardData, setLeaderboardData] = useState({
   participants: [],
   stats: {
     totalParticipants: 0,
     totalCombinedSteps: 0,
     progressToGoal: 0,
     projectedWinner: '',
   },
 });


 async function fetchData() {
   try {
     setIsLoading(true);
     const response = await fetch(
       'https://script.googleusercontent.com/macros/echo?user_content_key=86veE6hw-w6_vAhPIMd8XLoF5tKYyLBabU87h-EkoL9otI3bTJw9o0rvV6JMEug9A9B3SqbsOlFxbvlrpCuXiNnaMOo-rwJsm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnESZ9FomlWcHBKEE5T7yGg5KNjGzbXhBA5J6eWZ3PLDXzsi8kG6s6rJWbjovbc6olwSufCiXI4Z0f-YSPbZOTYwoxytcCfZN-w&lib=MAsZt3S0ioBofdB8Q4PE0S_c2JwAnkCxa',
     );
    
     if (!response.ok) {
       throw new Error(`HTTP error! status: ${response.status}`);
     }
    
     const data = await response.json();
     console.log('Fetched data:', data); // Debug log
      if (data.status === 'success') {
       console.log('Setting leaderboard data:', data.data); // Debug log
       setLeaderboardData(data.data);
     }
   } catch (error) {
     console.error('Error fetching leaderboard data:', error);
   } finally {
     setIsLoading(false);
   }
 }


 useEffect(() => {
   console.log('Current leaderboard data:', leaderboardData); // Debug log
   fetchData();
   const interval = setInterval(fetchData, 3000000);
   return () => clearInterval(interval);
 }, []);

 const hasEnoughData = () => {
  if (!leaderboardData.participants.length) return false;
  
  // Check if we have at least one day of data (excluding future dates)
  const firstParticipant = leaderboardData.participants[0];
  const completedDays = Object.values(firstParticipant.dailySteps)
    .filter(steps => steps > 0)
    .length;
    
  return completedDays >= 1;
};


 // Calculate total goal and progress
 const CHALLENGE_DAYS = 13; // Nov 18 to Nov 30 inclusive
 const DAILY_GOAL = 10000;
 const totalGoal = leaderboardData.stats.totalParticipants * DAILY_GOAL * CHALLENGE_DAYS;
 const progressPercentage = (leaderboardData.stats.totalCombinedSteps / totalGoal) * 100;


 const projectedWinner = leaderboardData.participants.reduce(
   (prev, current) => (current.averageSteps > prev.averageSteps ? current : prev),
   leaderboardData.participants[0] || { name: '', averageSteps: 0, totalSteps: 0 }
 );


 const circumference = 2 * Math.PI * 70;
 const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;
 const winnerProgress = (projectedWinner.totalSteps / DAILY_GOAL) * 100;


 if (isLoading) {
   return (
     <div className="min-h-screen bg-slate-900 text-gray-100 flex items-center justify-center">
       <div className="text-cyan-400 text-xl">Loading...</div>
     </div>
   );
 }
 console.log('Rendering with data:', {
   participants: leaderboardData.participants,
   stats: leaderboardData.stats,
   progressPercentage,
   projectedWinner
 });


 return (
   <main className="min-h-screen bg-slate-900 text-gray-100">
     <div className="max-w-7xl mx-auto p-8">
       {/* Header */}
       <div className="flex items-center justify-between mb-8">
         <h1 className="text-2xl font-semibold text-gray-100">
           10K Challenge
           <span className="block text-sm text-gray-400 mt-1">Nov 18th - Nov 30th 2024</span>
         </h1>
         <div className="flex items-center space-x-2 bg-slate-800 px-4 py-2 rounded-lg">
           <Users className="text-cyan-400" size={20} />
           <span className="text-gray-300">{leaderboardData.stats.totalParticipants} Participants</span>
         </div>
       </div>


       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Main Stats Panel */}
         <div className="md:col-span-2 bg-slate-800 rounded-xl p-6">
           <div className="flex items-center justify-between mb-6">
             <h2 className="text-lg font-semibold">Combined Progress</h2>
             <div className="text-cyan-400 font-semibold">{Math.round(progressPercentage)}%</div>
           </div>


           <div className="flex flex-col items-center justify-center h-64">
             <div className="relative w-40 h-40">
               <svg className="w-full h-full transform -rotate-90">
                 <circle cx="80" cy="80" r="70" className="stroke-slate-700" strokeWidth="8" fill="none" />
                 <circle
                   cx="80"
                   cy="80"
                   r="70"
                   className="stroke-cyan-400"
                   strokeWidth="8"
                   fill="none"
                   strokeLinecap="round"
                   style={{
                     strokeDasharray: circumference,
                     strokeDashoffset: strokeDashoffset,
                     transition: 'stroke-dashoffset 0.5s ease-in-out',
                   }}
                 />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-2xl font-bold text-cyan-400">
                   {leaderboardData.stats.totalCombinedSteps.toLocaleString()}
                 </span>
                 <span className="text-sm text-gray-400">steps</span>
               </div>
             </div>
             <p className="text-gray-400 mt-4">Total Steps</p>
           </div>
         </div>


         {hasEnoughData() ? (
            <div className="bg-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-center mb-8">Projected Winner</h2>
              <div className="flex flex-col items-center">
                <div className="relative mb-6">
                  <div className="w-24 h-24 rounded-full bg-slate-700 border-2 border-cyan-400 flex items-center justify-center">
                    <span className="text-3xl font-bold text-cyan-400">
                      {projectedWinner?.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="absolute -top-2 -right-2 bg-cyan-400 text-slate-900 w-8 h-8 rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                </div>

                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold mb-1">
                    {projectedWinner?.name?.charAt(0).toUpperCase() + projectedWinner?.name?.slice(1)}
                  </h3>
                  <p className="text-gray-400">
                    {projectedWinner?.averageSteps?.toLocaleString()} steps/day
                  </p>
                </div>

                <div className="relative w-full px-4">
                  <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                    <div
                      className="bg-cyan-400 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(winnerProgress, 100)}%`,
                        maxWidth: '100%',
                      }}
                    />
                  </div>
                  <p className="text-sm text-center text-gray-400">
                    {Math.round(winnerProgress)}% over goal
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800 rounded-xl p-6 flex items-center justify-center">
              <p className="text-gray-400 text-center">
                Projected winner will be shown after the first day of data
              </p>
            </div>
          )}
        </div>
        
        <LeaderboardTable participants={leaderboardData.participants} />
      </div>
    </main>
  );
}
