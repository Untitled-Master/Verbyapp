import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainNavbar from '../../components/MainNavbar';
import { useAuth } from '../../context/AuthContext';
import { ref, onValue } from 'firebase/database';
import { database } from '../../lib/firebase';
import { Zap, Swords, AlertCircle, CalendarCheck } from 'lucide-react';

const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #DEDDDA;
    border-radius: 2px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #9CA3AF;
  }
`;

const gameModes = [
  {
    id: 'blitz',
    name: 'Blitz',
    description: '60 seconds. How many verbs can you conjugate correctly? The ultimate test of muscle memory.',
    icon: <Zap size={20} />,
    color: '#333333',
  },
  {
    id: 'duels',
    name: 'Ranked Duels',
    description: 'Climb the global ladder. Compete head-to-head in real-time against players at your skill level.',
    icon: <Swords size={20} />,
    color: '#EB3514',
  },
  {
    id: 'mastery',
    name: 'Mistake Mastery',
    description: 'Verby tracks every error. This mode intelligently cycles back to the verbs you find hardest.',
    icon: <AlertCircle size={20} />,
    color: '#9CA3AF',
  },
  {
    id: 'daily',
    name: 'Daily Quest',
    description: 'A curated set of 10 puzzles every day. Maintain your streak and unlock new profile themes.',
    icon: <CalendarCheck size={20} />,
    color: '#6366F1',
  },
];

const formatNumber = (num) => {
  if (!num) return '0';
  return num.toLocaleString();
};

const Arena = () => {
  const { user } = useAuth();
  const [statsData, setStatsData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);

  useEffect(() => {
    if (!user) return;

    const statsRef = ref(database, `users/${user.uid}/stats`);
    const profileRef = ref(database, `users/${user.uid}/profile`);
    const gameHistoryRef = ref(database, `users/${user.uid}/gameHistory`);

    const unsubStats = onValue(statsRef, (snapshot) => {
      if (snapshot.exists()) {
        setStatsData(snapshot.val());
      }
    });

    const unsubProfile = onValue(profileRef, (snapshot) => {
      if (snapshot.exists()) {
        setProfileData(snapshot.val());
      }
    });

    const unsubHistory = onValue(gameHistoryRef, (snapshot) => {
      if (snapshot.exists()) {
        const history = snapshot.val();
        const allGames = [];
        
        Object.entries(history).forEach(([mode, games]) => {
          if (games && typeof games === 'object') {
            Object.entries(games).forEach(([gameId, gameData]) => {
              if (gameId !== '_initialized' && gameData && typeof gameData === 'object' && gameData.timestamp) {
                allGames.push({
                  id: gameId,
                  mode,
                  ...gameData,
                });
              }
            });
          }
        });
        
        allGames.sort((a, b) => b.timestamp - a.timestamp);
        setGameHistory(allGames.slice(0, 5));
      }
    });

    return () => {
      unsubStats();
      unsubProfile();
      unsubHistory();
    };
  }, [user]);

  const getGameStats = (modeId) => {
    if (!statsData || !statsData[modeId]) {
      return { games: 0, rating: 1200, wins: 0 };
    }
    const mode = statsData[modeId];
    return {
      games: mode.games || 0,
      rating: mode.rating || 1200,
      wins: mode.wins || 0,
    };
  };

  const getModeInfo = (modeId) => {
    return gameModes.find(m => m.id === modeId) || {};
  };

  const dailyStreak = statsData?.daily?.streak || 0;

  return (
    <div className="min-h-screen font-mono bg-[#F0EFEB] text-[#333333]">
      <style>{scrollbarStyles}</style>
      <MainNavbar />

      <div className="max-w-6xl mx-auto px-6 py-10 flex gap-8">
        <div className="hidden lg:block w-72 shrink-0">
          <div className="bg-[#F0EFEB] border border-[#DEDDDA] rounded-lg p-5 sticky top-24">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#DEDDDA]">
              <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-[#DEDDDA]">
                <img 
                  src={user?.photoURL && user.photoURL.trim() 
                    ? user.photoURL 
                    : "https://i.pinimg.com/736x/ec/49/f5/ec49f523af568d4fb71c1d771f07cb8c.jpg"} 
                  alt={user?.displayName || 'User'} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm truncate">{user?.displayName || 'Player'}</div>
                <div className="text-xs text-gray-400 truncate">{profileData?.bio || 'Verb master'}</div>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Ratings</h3>
              <div className="space-y-2">
                {gameModes.map((mode) => {
                  const { rating } = getGameStats(mode.id);
                  return (
                    <Link
                      key={mode.id}
                      to={`/community/${mode.id}`}
                      className="flex items-center justify-between p-2 rounded hover:bg-[#EAE9E4] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span style={{ color: mode.color }}>{mode.icon}</span>
                        <span className="text-xs text-gray-500">{mode.name}</span>
                      </div>
                      <span className="text-sm font-bold" style={{ color: mode.color }}>{rating}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Recent</h3>
              {gameHistory.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {gameHistory.map((game) => {
                    const modeInfo = getModeInfo(game.mode);
                    return (
                      <div 
                        key={game.id} 
                        className="p-2 rounded bg-white border border-[#DEDDDA]"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <span style={{ color: modeInfo.color }}>{modeInfo.icon}</span>
                            <span className="text-xs font-medium">{modeInfo.name || game.mode}</span>
                          </div>
                          {game.ratingChange !== undefined && (
                            <span className={`text-[10px] font-bold ${game.ratingChange >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                              {game.ratingChange >= 0 ? '+' : ''}{game.ratingChange}
                            </span>
                          )}
                        </div>
                        {game.mode === 'blitz' ? (
                          <div className="text-[10px] text-gray-400">
                            {game.correct}/{game.total} correct · {game.score} pts
                          </div>
                        ) : (
                          <div className="text-[10px] text-gray-400">
                            {game.won ? 'Victory' : 'Defeat'}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No games yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight mb-1">Choose Your Arena</h1>
            <p className="text-sm text-gray-500">Select a game mode to start practicing</p>
          </div>

          <div className="lg:hidden mb-6">
            <div className="flex items-center gap-3 p-3 bg-[#F0EFEB] border border-[#DEDDDA] rounded-lg">
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-[#DEDDDA] shrink-0">
                <img 
                  src={user?.photoURL && user.photoURL.trim() 
                    ? user.photoURL 
                    : "https://i.pinimg.com/736x/ec/49/f5/ec49f523af568d4fb71c1d771f07cb8c.jpg"} 
                  alt={user?.displayName || 'User'} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold truncate">{user?.displayName || 'Player'}</div>
                <div className="flex gap-3 mt-1">
                  {gameModes.slice(0, 2).map((mode) => {
                    const { rating } = getGameStats(mode.id);
                    return (
                      <div key={mode.id} className="flex items-center gap-1">
                        <span style={{ color: mode.color }}>{mode.icon}</span>
                        <span className="text-[10px] font-bold">{rating}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {gameModes.map((mode) => {
              const { games, rating } = getGameStats(mode.id);
              const isDaily = mode.id === 'daily';
              const streak = isDaily ? dailyStreak : 0;
              const isBlitz = mode.id === 'blitz';
              const isDisabled = !isBlitz;

              const cardContent = (
                <div
                  className={`group p-5 bg-[#F0EFEB] border border-[#DEDDDA] rounded-lg transition-all ${
                    isDisabled 
                      ? 'opacity-60 cursor-not-allowed' 
                      : 'hover:border-[#EB3514] hover:bg-[#EAE9E4]'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 bg-white border border-[#DEDDDA]"
                      style={{ color: mode.color }}
                    >
                      {mode.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-[#333333]">{mode.name}</h3>
                        {isDaily && streak > 0 && (
                          <span className="text-xs font-bold text-[#EB3514] uppercase tracking-wide">
                            🔥 {streak} Day Streak
                          </span>
                        )}
                        {isDisabled && (
                          <span className="text-xs font-bold text-[#EB3514] uppercase tracking-wide">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed mb-3">{mode.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400 uppercase tracking-wide">
                          {formatNumber(games)} {isDaily ? 'days' : 'games'}
                        </span>
                        <span className="text-sm font-bold" style={{ color: mode.color }}>
                          {rating} ELO
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );

              return isBlitz ? (
                <Link key={mode.id} to={`/arena/${mode.id}`}>{cardContent}</Link>
              ) : (
                <div key={mode.id}>{cardContent}</div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Arena;
