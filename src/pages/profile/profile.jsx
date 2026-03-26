
import { useState, useEffect } from 'react';
import MainNavbar from '../../components/MainNavbar';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { database } from '../../lib/firebase';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  Zap, Target, Globe, Calendar, Swords, AlertCircle, CalendarCheck, Pencil
} from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [ratingHistory, setRatingHistory] = useState([]);
  const [gameHistory, setGameHistory] = useState([]);

  useEffect(() => {
    if (!user) return;

    const profileRef = ref(database, `users/${user.uid}/profile`);
    const statsRef = ref(database, `users/${user.uid}/stats`);
    const historyRef = ref(database, `users/${user.uid}/ratingHistory`);
    const gameHistoryRef = ref(database, `users/${user.uid}/gameHistory`);

    const unsubProfile = onValue(profileRef, (snapshot) => {
      if (snapshot.exists()) {
        setProfileData(snapshot.val());
      }
    });

    const unsubStats = onValue(statsRef, (snapshot) => {
      if (snapshot.exists()) {
        setStatsData(snapshot.val());
      }
    });

    const unsubHistory = onValue(historyRef, (snapshot) => {
      if (snapshot.exists()) {
        const history = snapshot.val();
        const historyArray = Object.entries(history)
          .map(([date, data]) => ({
            name: date,
            ...data,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setRatingHistory(historyArray);
      }
    });

    const unsubGameHistory = onValue(gameHistoryRef, (snapshot) => {
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
        setGameHistory(allGames.slice(0, 20));
      }
    });

    return () => {
      unsubProfile();
      unsubStats();
      unsubHistory();
      unsubGameHistory();
    };
  }, [user]);
  const chartData = [
    { name: 'Mar 01', blitz: 1700, duels: 1820, mastery: 1400 },
    { name: 'Mar 05', blitz: 1740, duels: 1860, mastery: 1480 },
    { name: 'Mar 10', blitz: 1780, duels: 1890, mastery: 1520 },
    { name: 'Mar 15', blitz: 1800, duels: 1900, mastery: 1540 },
    { name: 'Mar 20', blitz: 1817, duels: 1915, mastery: 1560 },
    { name: 'Today', blitz: 1817, duels: 1923, mastery: 1568 },
  ];

  const variants = [
    { id: 'blitz', name: 'Blitz', color: '#333333', icon: <Zap size={14}/> },
    { id: 'duels', name: 'Duels', color: '#EB3514', icon: <Swords size={14}/> },
    { id: 'mastery', name: 'Mastery', color: '#9CA3AF', icon: <AlertCircle size={14}/> },
    { id: 'daily', name: 'Daily', color: '#6366F1', icon: <CalendarCheck size={14}/> },
  ];

  const getModeIcon = (mode) => {
    const variant = variants.find(v => v.id === mode);
    return variant?.icon || <Target size={14}/>;
  };

  const getModeName = (mode) => {
    const variant = variants.find(v => v.id === mode);
    return variant?.name || mode;
  };

  const formatGameText = (game) => {
    switch (game.mode) {
      case 'blitz':
        return `Played Blitz - ${game.correct || 0}/${game.total || 0} correct`;
      case 'duels':
        return `Played Duels - ${game.won ? 'Won' : 'Lost'}`;
      case 'mastery':
        return `Played Mastery - ${game.correct || 0} mistakes reviewed`;
      case 'daily':
        return `Completed Daily Quest - ${game.completed ? 'Done' : 'Incomplete'}`;
      default:
        return `Played ${getModeName(game.mode)}`;
    }
  };

  return (
    <div className="min-h-screen bg-[#F0EFEB] text-[#1a1a1a] font-sans">
      <MainNavbar />

      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row min-h-[calc(100vh-65px)]">
        
          {/* LEFT SIDEBAR - RATINGS ONLY */}
        <aside className="w-full lg:w-[280px] border-r border-[#DEDDDA] p-6 lg:p-8 bg-white">
          <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4">Ratings</h3>
          <div className="flex flex-col gap-3">
            {statsData && Object.entries(statsData).map(([key, data]) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-[#F0EFEB]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${variants.find(v => v.id === key)?.color || '#9CA3AF'}15` }}>
                    <span style={{ color: variants.find(v => v.id === key)?.color || '#9CA3AF' }}>
                      {variants.find(v => v.id === key)?.icon || <Target size={14}/>}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold">{key.charAt(0).toUpperCase() + key.slice(1)}</h4>
                    <p className="text-[10px] text-gray-400">{data.games || 0} games</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold">{data.rating || 1200}</div>
                  <div className="text-[10px] text-gray-400">{data.rank ? `#${data.rank}` : 'Unranked'}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 min-w-0 bg-[#F0EFEB]">
          
          {/* Rating Graph + Bio */}
          <div className="p-6 lg:p-10 border-b border-[#DEDDDA] bg-white">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Bio Sidebar - 1/3 */}
              <div className="w-full lg:w-[280px] flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-[#DEDDDA] shrink-0">
                    <img 
                      src={user?.photoURL || "https://i.pinimg.com/736x/ec/49/f5/ec49f523af568d4fb71c1d771f07cb8c.jpg"} 
                      alt={user?.displayName || 'User'} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h1 className="text-xl font-semibold tracking-tight">{user?.displayName || 'User'}</h1>
                      <Link to="/profile/edit">
                        <button className="p-1.5 rounded-lg hover:bg-[#F0EFEB] transition-colors text-gray-400 hover:text-gray-600">
                          <Pencil size={14}/>
                        </button>
                      </Link>
                    </div>
                    <p className="text-sm text-gray-500">Language Enthusiast</p>
                  </div>
                </div>

                {profileData?.bio && (
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {profileData.bio}
                  </p>
                )}

                <div className="space-y-2">
                  {profileData?.country && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className={`fi fi-${profileData.country}`}></span>
                      <span>{profileData.country.toUpperCase()}</span>
                    </div>
                  )}
                  {profileData?.languages?.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Globe size={14}/>
                      <span>{profileData.languages.join(', ')}</span>
                    </div>
                  )}
                  {profileData?.createdAt && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar size={14}/>
                      <span>Joined {new Date(profileData.createdAt).getFullYear()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Rating Graph - 2/3 */}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Performance</h2>
                    <h2 className="text-xl font-semibold tracking-tight">Rating Evolution</h2>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#333333]"/></span> Blitz
                    <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#EB3514]"/></span> Duels
                    <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-gray-400"/></span> Mastery
                  </div>
                </div>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ratingHistory.length > 0 ? ratingHistory : chartData}>
                      <CartesianGrid strokeDasharray="1 3" stroke="#e5e5e5" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 11, fill: '#9CA3AF'}} 
                        dy={10}
                      />
                      <YAxis 
                        domain={['dataMin - 100', 'dataMax + 100']} 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 11, fill: '#9CA3AF'}} 
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '11px', fontFamily: 'system-ui, sans-serif' }}
                        itemStyle={{ padding: '2px 0' }}
                      />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ paddingTop: '16px', fontSize: '11px' }}/>
                      <Line type="monotone" dataKey="blitz" stroke="#333333" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} name="Blitz" />
                      <Line type="monotone" dataKey="duels" stroke="#EB3514" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} name="Duels" />
                      <Line type="monotone" dataKey="mastery" stroke="#9CA3AF" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} name="Mastery" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Game Modes */}
          {/* <div className="p-6 lg:p-10 border-b border-[#DEDDDA] bg-white">
            <h2 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-6">Game Modes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gameModes.map((mode) => (
                <div key={mode.id} className="p-5 rounded-xl border border-[#DEDDDA] hover:border-gray-400 transition-colors cursor-pointer group">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${mode.color}15`, color: mode.color }}>
                      {mode.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold mb-1">{mode.name}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">{mode.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div> */}

          {/* Activity Feed */}
          <div className="p-6 lg:p-10 bg-white">
            <h2 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-6">Recent Activity</h2>
            {gameHistory.length > 0 ? (
              <div className="space-y-4">
                {gameHistory.map((game) => (
                  <div key={game.id} className="flex items-center justify-between gap-4 py-3 border-b border-[#DEDDDA]/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#F0EFEB]">
                        <span className="text-gray-500">{getModeIcon(game.mode)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{formatGameText(game)}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(game.timestamp).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    {game.ratingChange && (
                      <span className={`text-sm font-semibold ${game.ratingChange > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {game.ratingChange > 0 ? '+' : ''}{game.ratingChange}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No activity yet. Start playing to see your history here!</p>
            )}
          </div>
        </main>

      </div>
      
      <footer className="py-4 px-6 border-t border-[#DEDDDA] text-[10px] text-gray-400 flex justify-between bg-[#F0EFEB]">
        <span>VERBY. // User ID: {user?.uid?.slice(0, 8) || 'Guest'}</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-gray-600 transition-colors">Privacy</a>
          <a href="#" className="hover:text-gray-600 transition-colors">Terms</a>
        </div>
      </footer>
    </div>
  );
};

export default Profile;
