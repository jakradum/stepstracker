import { Users, ChevronUp, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import LeaderboardTable from './Components/LeaderboardTable';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState({
    participants: [],
    stats: {
      totalParticipants: 0,
      totalCombinedSteps: 0,
      progressToGoal: 0,
      projectedWinner: '',
    },
    config: {
      title: '',
      target: 10000,
      status: 'active',
      specialTargets: []
    },
    dateRange: {
      start: '',
      end: ''
    }
  });

  async function fetchData() {
    try {
      setIsLoading(true);
      const response = await fetch(
        'https://script.googleusercontent.com/macros/echo?user_content_key=JNgKeuf9hb3vDAbrffWdAnCXpNZutICpM4fiQ5n1pXHu3F3ZlQiMbOcy5LN4NDelX10JuyoQSisWvbRArlr5hFkkX2cA21AAm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnOwKVs0f7KFRw3QYAmECC5kRIx6Vr7oykkZDUICg6f1oxcRveLLjXDJZTAWfmgD75gzbCmodmPUABlPUnuPK-Xypdqj9mwWbAA&lib=MAsZt3S0ioBofdB8Q4PE0S_c2JwAnkCxa'
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        setLeaderboardData(data.data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000); // 5 minutes
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

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Calculate total goal and progress
  const getChallengeDuration = () => {
    const start = new Date(leaderboardData.dateRange.start);
    const end = new Date(leaderboardData.dateRange.end);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };
  const defaultGoal = leaderboardData.config.target || 10000;
  const CHALLENGE_DAYS = 13;
  const totalGoal = leaderboardData.stats.totalParticipants * 
  defaultGoal * 
  getChallengeDuration();
  const progressPercentage = (leaderboardData.stats.totalCombinedSteps / totalGoal) * 100;

  const projectedWinner = leaderboardData.participants.reduce(
    (prev, current) => (current.averageSteps > prev.averageSteps ? current : prev),
    leaderboardData.participants[0] || { name: '', averageSteps: 0, totalSteps: 0 }
  );

  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;
  const winnerProgress = (projectedWinner.totalSteps / defaultGoal) * 100;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-gray-100 flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Loading...</div>
      </div>
    );
  }
 
  

  return (
    <main className="min-h-screen bg-slate-900 text-gray-100">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-gray-100">
            {leaderboardData.config.title || '10K Challenge'}
            <span className="block text-sm text-gray-400 mt-1">
              {formatDate(leaderboardData.dateRange.start)} - {formatDate(leaderboardData.dateRange.end)}
            </span>
          </h1>
          <div className="flex items-center space-x-2 bg-slate-800 px-4 py-2 rounded-lg">
            <Users className="text-cyan-400" size={20} />
            <span className="text-gray-300">{leaderboardData.stats.totalParticipants} Participants</span>
          </div>
        </div>

        {leaderboardData.config.status === 'completed' ? (
          // Winner Display for completed challenge
          <div className="bg-slate-800 rounded-xl p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">🏅 Winner 🏅</h2>
            <div className="text-4xl font-bold text-cyan-400 mb-2">
              {projectedWinner?.name?.charAt(0).toUpperCase() + projectedWinner?.name?.slice(1)}
            </div>
            <div className="text-gray-400">{projectedWinner?.totalSteps?.toLocaleString()} total steps</div>

            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="mt-6 flex items-center gap-2 mx-auto text-gray-400 hover:text-cyan-400 transition-colors"
            >
              {showLeaderboard ? (
                <>
                  Hide Leaderboard <ChevronUp size={20} />
                </>
              ) : (
                <>
                  Show Leaderboard <ChevronDown size={20} />
                </>
              )}
            </button>

            {showLeaderboard && (
              <LeaderboardTable
                participants={leaderboardData.participants}
                specialTargets={leaderboardData.config.specialTargets}
                defaultTarget={leaderboardData.config.target}
              />
            )}
          </div>
        ) : (
          // Regular display for active challenge
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Main Stats Panel */}
              {/* Main Stats Panel */}
              <div className="md:col-span-2 bg-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Combined Progress</h2>
                  <div className="flex flex-col items-end">
                    <div className="text-cyan-400 font-semibold">{Math.round(progressPercentage)}%</div>
                    {/* Days remaining calculation */}
                    <div className="text-sm text-gray-400">
                      {(() => {
                        const endDate = new Date(leaderboardData.dateRange.end);
                        const today = new Date();
                        const diffTime = endDate - today;
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return `${diffDays} day${diffDays !== 1 ? 's' : ''} remaining`;
                      })()}
                    </div>
                  </div>
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

              {/* Projected Winner Panel - Only show if there's enough data */}
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
                      <p className="text-gray-400">{projectedWinner?.averageSteps?.toLocaleString()} steps/day</p>
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
                      <p className="text-sm text-center text-gray-400">{Math.round(winnerProgress)}% of goal</p>
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
            <LeaderboardTable
              participants={leaderboardData.participants}
              specialTargets={leaderboardData.config.specialTargets}
              defaultTarget={leaderboardData.config.target}
            />
          </>
        )}
      </div>
    </main>
  );
}