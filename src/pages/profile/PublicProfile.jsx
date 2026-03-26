import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainNavbar from '../../components/MainNavbar';
import { ref, onValue, get } from 'firebase/database';
import { database } from '../../lib/firebase';
import { 
  Zap, Swords, Flame, 
  ArrowLeft, Globe, Calendar, Target 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const GOLD_TROPHY_IMG = 'https://lichess1.org/assets/hashed/gold-cup-2.e1e2ac3f.png';
const SILVER_TROPHY_IMG = 'https://lichess1.org/assets/hashed/silver-cup-2.d820d24e.png';

const variants = [
  { id: 'blitz', name: 'Blitz', color: '#333333', icon: <Zap size={14}/> },
  { id: 'streak', name: 'Streak', color: '#EB3514', icon: <Flame size={14}/> },
  { id: 'duels', name: 'Duels', color: '#C0C0C0', icon: <Swords size={14}/> },
];

const PublicProfile = () => {
  const { id } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [ratingHistory, setRatingHistory] = useState([]);
  const [ranks, setRanks] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const profileRef = ref(database, `users/${id}/profile`);
    const statsRef = ref(database, `users/${id}/stats`);
    const gameHistoryRef = ref(database, `users/${id}/gameHistory`);
    const ratingHistoryRef = ref(database, `users/${id}/ratingHistory`);

    const unsubProfile = onValue(profileRef, (snapshot) => {
      if (snapshot.exists()) setProfileData(snapshot.val());
      setLoading(false);
    });

    const unsubStats = onValue(statsRef, (snapshot) => {
      if (snapshot.exists()) setStatsData(snapshot.val());
    });

    const unsubGameHistory = onValue(gameHistoryRef, (snapshot) => {
      if (snapshot.exists()) {
        const history = snapshot.val();
        const allGames = [];
        Object.entries(history).forEach(([mode, games]) => {
          if (games && typeof games === 'object') {
            Object.entries(games).forEach(([gameId, gameData]) => {
              if (gameId !== '_initialized' && gameData?.timestamp) {
                allGames.push({ id: gameId, mode, ...gameData });
              }
            });
          }
        });
        allGames.sort((a, b) => b.timestamp - a.timestamp);
        setGameHistory(allGames.slice(0, 15));
      }
    });

    const unsubRatingHistory = onValue(ratingHistoryRef, (snapshot) => {
      if (snapshot.exists()) {
        const history = snapshot.val();
        setRatingHistory(Object.entries(history).map(([date, data]) => ({
          name: date.slice(5), // Short date
          ...data,
        })).sort((a, b) => a.name.localeCompare(b.name)));
      }
    });

    return () => {
      unsubProfile(); unsubStats(); unsubGameHistory(); unsubRatingHistory();
    };
  }, [id]);

  useEffect(() => {
    const fetchRanks = async () => {
      const newRanks = {};
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      if (snapshot.exists()) {
        variants.forEach(v => {
          const sorted = [];
          snapshot.forEach(u => {
            const s = u.val().stats?.[v.id];
            if (s?.games > 0) sorted.push({ id: u.key, r: s.rating || 1200 });
          });
          sorted.sort((a, b) => b.r - a.r);
          const idx = sorted.findIndex(u => u.id === id);
          if (idx !== -1) newRanks[v.id] = idx + 1;
        });
      }
      setRanks(newRanks);
    };
    if (!loading) fetchRanks();
  }, [id, loading]);

  const formatGameText = (game) => {
    switch (game.mode) {
      case 'blitz': return `Blitz - ${game.correct || 0}/${game.total || 0}`;
      case 'duels': return `Duels - ${game.won ? 'Won' : 'Lost'}`;
      case 'streak': return `Streak - ${game.streak || 0}`;
      default: return game.mode;
    }
  };

  if (loading) return <div className="min-h-screen bg-[#F0EFEB]" />;
  if (!profileData) return <div className="p-20 text-center">User not found</div>;

  const top10Modes = variants.filter(v => ranks[v.id] && ranks[v.id] <= 10);

  return (
    <div className="min-h-screen bg-[#F0EFEB] text-[#1a1a1a] font-sans">
      <MainNavbar />

      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row min-h-[calc(100vh-65px)]">
        
        {/* LEFT SIDEBAR - RATINGS */}
        <aside className="w-full lg:w-[300px] border-r border-[#DEDDDA] p-6 lg:p-8 bg-white">
          <div className="mb-8">
            <Link to="/" className="flex items-center gap-2 text-xs text-gray-400 hover:text-black mb-6 transition-colors">
              <ArrowLeft size={14} /> Back to Community
            </Link>
            <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4">Player Stats</h3>
            <div className="flex flex-col gap-3">
              {variants.map((variant) => {
                const isStreak = variant.id === 'streak';
                const data = statsData?.[variant.id] || (isStreak ? { bestStreak: 0 } : { rating: 1200, games: 0 });
                const rank = ranks[variant.id];
                return (
                  <div key={variant.id} className="flex items-center justify-between p-3 rounded-xl bg-[#F0EFEB]/50 border border-transparent hover:border-[#DEDDDA] transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${variant.color}15` }}>
                        <span style={{ color: variant.color }}>{variant.icon}</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold">{variant.name}</h4>
                        <p className="text-[10px] text-gray-400">{isStreak ? 'Best streak' : `${data.games || 0} games`}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold">{isStreak ? (data.bestStreak || 0) : (data.rating || 1200)}</div>
                      {!isStreak && rank && <div className="text-[10px] text-[#EB3514] font-medium">#{rank}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {top10Modes.length > 0 && (
            <div>
              <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4">Achievements</h3>
              <div className="grid grid-cols-2 gap-2">
                {top10Modes.map(mode => {
                  const rank = ranks[mode.id];
                  const isGold = rank === 1;
                  return (
                    <div key={mode.id} className={`${isGold ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'} border p-2 rounded-lg flex flex-col items-center text-center`}>
                      <img src={isGold ? GOLD_TROPHY_IMG : SILVER_TROPHY_IMG} className="w-8 h-8 object-contain mb-1" alt="trophy" />
                      <span className={`text-[9px] font-bold uppercase ${isGold ? 'text-yellow-700' : 'text-gray-600'}`}>
                        {isGold ? '#1 ' : `Top ${rank} `}{mode.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 min-w-0 bg-[#F0EFEB]">
          
          {/* Header Section: Bio + Graph */}
          <div className="p-6 lg:p-10 border-b border-[#DEDDDA] bg-white">
            <div className="flex flex-col lg:flex-row gap-10">
              
              {/* User Bio Stats */}
              <div className="w-full lg:w-[300px] flex flex-col gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-[#F0EFEB] shrink-0">
                    <img 
                      src={profileData.photoURL || "https://i.pravatar.cc/150"} 
                      alt={profileData.displayName} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold tracking-tight">{profileData.displayName}</h1>
                      {profileData.country && (
                        <span className={`fi fi-${profileData.country.toLowerCase()} rounded-sm`}></span>
                      )}
                    </div>
                  </div>
                </div>

                {profileData.bio && (
                  <p className="text-sm text-gray-600 leading-relaxed italic">
                    &ldquo;{profileData.bio}&rdquo;
                  </p>
                )}

                <div className="space-y-3 pt-4 border-t border-[#F0EFEB]">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Globe size={14} className="text-gray-400" />
                    <span>{profileData.languages ? Object.values(profileData.languages).join(', ') : 'English'}</span>
                  </div>
                  {profileData.createdAt && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Calendar size={14} className="text-gray-400" />
                      <span>Joined {new Date(profileData.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric'})}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Rating Evolution Graph */}
              <div className="flex-1">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Performance</h2>
                    <h2 className="text-xl font-bold tracking-tight">Rating Evolution</h2>
                  </div>
                  <div className="hidden sm:flex gap-4 text-[10px] font-bold uppercase tracking-wider">
                    {variants.slice(0, 3).map(v => (
                      <span key={v.id} className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: v.color }} /> {v.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ratingHistory.length > 0 ? ratingHistory : [{name: 'Today', blitz: 1200, duels: 1200}]}>
                      <CartesianGrid strokeDasharray="1 3" stroke="#e5e5e5" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} dy={10} />
                      <YAxis domain={['dataMin - 50', 'dataMax + 50']} axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                      />
                      <Line type="monotone" dataKey="blitz" stroke="#333333" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} name="Blitz" />
                      <Line type="monotone" dataKey="duels" stroke="#EB3514" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} name="Duels" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="p-6 lg:p-10 bg-white ">
            <h2 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Target size={14}/> Recent Activity
            </h2>
            <div className="space-y-1">
              {gameHistory.length > 0 ? (
                gameHistory.map((game) => (
                  <div key={game.id} className="flex items-center justify-between gap-4 py-4 border-b border-[#F0EFEB] last:border-0 hover:bg-[#F0EFEB]/30 px-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#F0EFEB]">
                        <span className="text-gray-500">
                          {variants.find(v => v.id === game.mode)?.icon || <Target size={14}/>}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{formatGameText(game)}</p>
                        <p className="text-[11px] text-gray-400">
                          {new Date(game.timestamp).toLocaleDateString('en-US', { 
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {game.ratingChange && (
                        <span className={`text-sm font-bold ${game.ratingChange > 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {game.ratingChange > 0 ? '+' : ''}{game.ratingChange}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 py-10 text-center">No recent games played.</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PublicProfile;