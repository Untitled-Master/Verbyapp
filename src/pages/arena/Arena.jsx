import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainNavbar from '../../components/MainNavbar';
import { useAuth } from '../../context/AuthContext';
import { ref, onValue } from 'firebase/database';
import { database } from '../../lib/firebase';
import { Zap, Swords, AlertCircle, CalendarCheck, Trophy, Clock, Target, Flame } from 'lucide-react';

const Arena = () => {
  const { user } = useAuth();
  const [statsData, setStatsData] = useState(null);
  const [achievementsData, setAchievementsData] = useState(null);

  useEffect(() => {
    if (!user) return;

    const statsRef = ref(database, `users/${user.uid}/stats`);
    const achievementsRef = ref(database, `users/${user.uid}/achievements`);

    const unsubStats = onValue(statsRef, (snapshot) => {
      if (snapshot.exists()) {
        setStatsData(snapshot.val());
      }
    });

    const unsubAchievements = onValue(achievementsRef, (snapshot) => {
      if (snapshot.exists()) {
        setAchievementsData(snapshot.val());
      }
    });

    return () => {
      unsubStats();
      unsubAchievements();
    };
  }, [user]);

  const gameModes = [
    {
      id: 'blitz',
      name: 'Blitz',
      description: '60 seconds. How many verbs can you conjugate correctly? The ultimate test of muscle memory.',
      icon: <Zap size={32} />,
      color: '#333333',
    },
    {
      id: 'duels',
      name: 'Ranked Duels',
      description: 'Climb the global ladder. Compete head-to-head in real-time against players at your skill level.',
      icon: <Swords size={32} />,
      color: '#EB3514',
    },
    {
      id: 'mastery',
      name: 'Mistake Mastery',
      description: 'Verby tracks every error. This mode intelligently cycles back to the verbs you find hardest.',
      icon: <AlertCircle size={32} />,
      color: '#9CA3AF',
    },
    {
      id: 'daily',
      name: 'Daily Quest',
      description: 'A curated set of 10 puzzles every day. Maintain your streak and unlock new profile themes.',
      icon: <CalendarCheck size={32} />,
      color: '#6366F1',
    },
  ];

  const getGameStats = (modeId) => {
    if (!statsData || !statsData[modeId]) {
      return { games: 0, rating: 1200 };
    }
    const mode = statsData[modeId];
    return {
      games: mode.games || 0,
      rating: mode.rating || 1200,
    };
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    return num.toLocaleString();
  };

  const quickStats = [
    { icon: <Trophy size={16} />, label: 'Global Rank', value: '#54,439' },
    { icon: <Target size={16} />, label: 'Accuracy', value: '88.2%' },
    { icon: <Flame size={16} />, label: 'Streak', value: `${achievementsData?.longestStreak || 0} Days` },
  ];

  return (
    <div className="min-h-screen bg-[#F0EFEB] text-[#1a1a1a] font-sans">
      <MainNavbar />

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Choose Your Arena</h1>
          <p className="text-gray-500">Select a game mode to start practicing</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {gameModes.map((mode) => {
            const { games, rating } = getGameStats(mode.id);
            const isDaily = mode.id === 'daily';
            const streak = statsData?.daily?.streak || 0;

            return (
              <Link 
                key={mode.id}
                to={`/arena/${mode.id}`}
                className="group bg-white rounded-2xl border border-[#DEDDDA] p-6 hover:border-[#EB3514] hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start gap-5">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${mode.color}15`, color: mode.color }}
                  >
                    {mode.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold">{mode.name}</h3>
                      {isDaily && streak > 0 && (
                        <span className="text-xs font-medium text-[#EB3514] bg-[#EB3514]/10 px-2 py-1 rounded-full">
                          🔥 {streak} Day Streak
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed mb-4">{mode.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatNumber(games)} {isDaily ? 'days' : 'games'}
                        </span>
                      </div>
                      <div className="text-sm font-semibold" style={{ color: mode.color }}>
                        {rating} ELO
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

{/* 
        <div className="bg-white rounded-2xl border border-[#DEDDDA] p-8">
          <h2 className="text-lg font-semibold mb-6">Your Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickStats.map((stat, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#F0EFEB] flex items-center justify-center text-gray-500">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-lg font-semibold">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Arena;
