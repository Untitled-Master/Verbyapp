import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainNavbar from '../../components/MainNavbar';
import { useAuth } from '../../context/AuthContext';
import { ref, get } from 'firebase/database';
import { database } from '../../lib/firebase';
import { Users, Gamepad2, BarChart3, Clock, Flame, Zap, Coffee } from 'lucide-react';

const Admin = () => {
  useAuth();
  const [users, setUsers] = useState([]);
  const [allGames, setAllGames] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGames: 0,
    blitzGames: 0,
    streakGames: 0,
    zenCorrect: 0,
    zenWrong: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRef = ref(database, 'users');
        const snapshot = await get(usersRef);
        
        if (snapshot.exists()) {
          const usersData = [];
          let totalGames = 0;
          let blitzGames = 0;
          let streakGames = 0;
          let zenCorrect = 0;
          let zenWrong = 0;
          
          snapshot.forEach((child) => {
            const userData = child.val();
            const profile = userData.profile || {};
            const stats = userData.stats || {};
            
            let userGameCount = 0;
            const gameHistory = userData.gameHistory || {};
            
            Object.entries(gameHistory).forEach(([mode, games]) => {
              if (games && typeof games === 'object') {
                Object.entries(games).forEach(([gameId, game]) => {
                  if (gameId !== '_initialized' && game && game.timestamp) {
                    userGameCount++;
                    totalGames++;
                    if (mode === 'blitz') blitzGames++;
                    if (mode === 'streak') streakGames++;
                    if (mode === 'zen' && game.correct) zenCorrect += game.correct || 0;
                    if (mode === 'zen' && game.wrong) zenWrong += game.wrong || 0;
                  }
                });
              }
            });

            const blitzStats = stats.blitz || {};
            const streakStats = stats.streak || {};
            const zenStats = stats.zen || {};
            
            if (streakStats.games) streakGames += streakStats.games;
            if (zenStats.correct) zenCorrect += zenStats.correct;
            if (zenStats.wrong) zenWrong += zenStats.wrong;
            
            usersData.push({
              uid: child.key,
              displayName: profile.displayName || 'Unknown',
              photoURL: profile.photoURL || null,
              role: profile.role || 'user',
              gamesPlayed: userGameCount,
              blitzRating: blitzStats.rating || 1200,
              bestStreak: streakStats.bestStreak || 0,
              zenRatio: zenStats.correct && zenStats.wrong 
                ? `${zenStats.correct}/${zenStats.correct + zenStats.wrong}` 
                : '0/0',
              lastLogin: profile.lastLogin || null,
            });
          });

          setStats({
            totalUsers: usersData.length,
            totalGames,
            blitzGames,
            streakGames,
            zenCorrect,
            zenWrong,
          });

          usersData.sort((a, b) => {
            if (a.role === 'admin' && b.role !== 'admin') return -1;
            if (a.role !== 'admin' && b.role === 'admin') return 1;
            return b.gamesPlayed - a.gamesPlayed;
          });

          setUsers(usersData);

          const allGamesData = [];
          snapshot.forEach((child) => {
            const gameHistory = child.val().gameHistory || {};
            Object.entries(gameHistory).forEach(([mode, games]) => {
              if (games && typeof games === 'object') {
                Object.entries(games).forEach(([gameId, game]) => {
                  if (gameId !== '_initialized' && game && game.timestamp) {
                    allGamesData.push({
                      id: gameId,
                      userId: child.key,
                      mode,
                      ...game,
                    });
                  }
                });
              }
            });
          });

          allGamesData.sort((a, b) => b.timestamp - a.timestamp);
          setAllGames(allGamesData.slice(0, 50));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'blitz': return <Zap size={14} className="text-[#333333]" />;
      case 'streak': return <Flame size={14} className="text-[#EB3514]" />;
      case 'zen': return <Coffee size={14} className="text-[#6366F1]" />;
      default: return <Gamepad2 size={14} className="text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen font-mono bg-[#F0EFEB] text-[#333333]">
        <MainNavbar />
        <div className="flex items-center justify-center h-[calc(100vh-65px)]">
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-mono bg-[#F0EFEB] text-[#333333]">
      <MainNavbar />
      
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Platform overview and user management</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-[#DEDDDA] rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-[#6366F1]/10 flex items-center justify-center">
                <Users size={20} className="text-[#6366F1]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-xs text-gray-400">Total Users</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#DEDDDA] rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-[#333333]/10 flex items-center justify-center">
                <Gamepad2 size={20} className="text-[#333333]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalGames}</p>
                <p className="text-xs text-gray-400">Total Games</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#DEDDDA] rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-[#EB3514]/10 flex items-center justify-center">
                <Flame size={20} className="text-[#EB3514]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.streakGames}</p>
                <p className="text-xs text-gray-400">Streak Games</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#DEDDDA] rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <BarChart3 size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.zenCorrect}/{stats.zenCorrect + stats.zenWrong}</p>
                <p className="text-xs text-gray-400">Zen Accuracy</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white border border-[#DEDDDA] rounded-lg">
            <div className="p-4 border-b border-[#DEDDDA]">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Users size={18} />
                Users ({users.length})
              </h2>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F0EFEB] sticky top-0">
                  <tr>
                    <th className="text-left p-3 font-semibold">User</th>
                    <th className="text-center p-3 font-semibold">Blitz</th>
                    <th className="text-center p-3 font-semibold">Streak</th>
                    <th className="text-center p-3 font-semibold">Games</th>
                    <th className="text-center p-3 font-semibold">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.uid} className="border-t border-[#DEDDDA] hover:bg-[#F0EFEB] transition-colors">
                      <td className="p-3">
                        <Link 
                          to={`/profile/${u.uid}`}
                          className="flex items-center gap-2 hover:text-[#6366F1]"
                        >
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-[#F0EFEB]">
                            {u.photoURL ? (
                              <img src={u.photoURL} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs">
                                {u.displayName.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span className="font-medium truncate max-w-[120px]">{u.displayName}</span>
                        </Link>
                      </td>
                      <td className="p-3 text-center font-mono">{u.blitzRating}</td>
                      <td className="p-3 text-center font-mono">{u.bestStreak} 🔥</td>
                      <td className="p-3 text-center font-mono">{u.gamesPlayed}</td>
                      <td className="p-3 text-center">
                        <span className={`text-xs px-2 py-1 rounded ${
                          u.role === 'admin' 
                            ? 'bg-[#6366F1] text-white' 
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-[#DEDDDA] rounded-lg">
            <div className="p-4 border-b border-[#DEDDDA]">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Clock size={18} />
                Recent Games ({allGames.length})
              </h2>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {allGames.length > 0 ? (
                <div className="divide-y divide-[#DEDDDA]">
                  {allGames.map((game) => (
                    <Link
                      key={`${game.id}-${game.userId}`}
                      to={`/profile/${game.userId}`}
                      className="flex items-center justify-between p-3 hover:bg-[#F0EFEB] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-[#F0EFEB] flex items-center justify-center">
                          {getModeIcon(game.mode)}
                        </div>
                        <div>
                          <p className="font-medium text-sm capitalize">{game.mode}</p>
                          <p className="text-xs text-gray-400">
                            {game.mode === 'blitz' && `${game.correct || 0}/${game.total || 0} correct`}
                            {game.mode === 'streak' && `${game.streak || 0} streak`}
                            {game.mode === 'zen' && `${game.correct || 0}/${(game.correct || 0) + (game.wrong || 0)} correct`}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatDate(game.timestamp)}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400">
                  No games yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
