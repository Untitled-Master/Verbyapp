import { useState, useEffect } from 'react';
import { ref, onValue, query, orderByChild } from 'firebase/database';
import { database } from '../../lib/firebase';
import MainNavbar from '../../components/MainNavbar';
import { CalendarCheck, Trophy, Target, TrendingUp } from 'lucide-react';

const CommunityDaily = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const playersPerPage = 20;

  useEffect(() => {
    const leaderboardRef = query(
      ref(database, 'users'),
      orderByChild('stats/daily/rating'),
    );

    const unsubscribe = onValue(leaderboardRef, (snapshot) => {
      if (snapshot.exists()) {
        const users = [];
        snapshot.forEach((child) => {
          const data = child.val();
          const stats = data.stats?.daily;
          if (stats && stats.games > 0) {
            users.push({
              uid: child.key,
              displayName: data.profile?.displayName || 'Anonymous',
              photoURL: data.profile?.photoURL || '',
              rating: stats.rating || 1200,
              games: stats.games || 0,
              streak: stats.streak || 0,
              rank: stats.rank || 'Unranked',
            });
          }
        });

        users.sort((a, b) => b.rating - a.rating);
        users.forEach((user, index) => {
          user.position = index + 1;
        });

        setPlayers(users);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getRankTier = (position) => {
    if (position === 1) return { name: 'Champion', color: '#FFD700', bg: '#FFF8DC' };
    if (position === 2) return { name: 'Grandmaster', color: '#C0C0C0', bg: '#F5F5F5' };
    if (position === 3) return { name: 'Master', color: '#CD7F32', bg: '#FFF5EE' };
    if (position <= 10) return { name: 'Diamond', color: '#6366F1', bg: '#EEF2FF' };
    if (position <= 50) return { name: 'Platinum', color: '#14B8A6', bg: '#F0FDFA' };
    if (position <= 100) return { name: 'Gold', color: '#EAB308', bg: '#FEFCE8' };
    if (position <= 250) return { name: 'Silver', color: '#9CA3AF', bg: '#F9FAFB' };
    return { name: 'Bronze', color: '#92400E', bg: '#FFFBEB' };
  };

  const getPositionStyle = (position) => {
    if (position === 1) return 'bg-gradient-to-r from-yellow-400/20 to-yellow-600/10';
    if (position === 2) return 'bg-gradient-to-r from-gray-300/20 to-gray-400/10';
    if (position === 3) return 'bg-gradient-to-r from-amber-600/20 to-amber-700/10';
    return '';
  };

  const indexOfLastPlayer = currentPage * playersPerPage;
  const indexOfFirstPlayer = indexOfLastPlayer - playersPerPage;
  const currentPlayers = players.slice(indexOfFirstPlayer, indexOfLastPlayer);
  const totalPages = Math.ceil(players.length / playersPerPage);

  return (
    <div className="min-h-screen bg-[#F0EFEB] text-[#1a1a1a] font-sans">
      <MainNavbar />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-600 mb-4">
            <CalendarCheck size={16} />
            <span className="text-sm font-medium">Daily Quest Leaderboard</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">Community Rankings</h1>
          <p className="text-gray-500 max-w-md mx-auto">
            Daily streaks and consistent players dominate this leaderboard
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-[#DEDDDA] p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-3">
              <Target size={24} className="text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-[#333333]">{players.length}</div>
            <div className="text-xs text-gray-400">Active Players</div>
          </div>
          <div className="bg-white rounded-2xl border border-[#DEDDDA] p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-3">
              <TrendingUp size={24} className="text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-[#333333]">
              {players.length > 0 ? players[0]?.rating : '-'}
            </div>
            <div className="text-xs text-gray-400">Top Rating</div>
          </div>
          <div className="bg-white rounded-2xl border border-[#DEDDDA] p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mx-auto mb-3">
              <Trophy size={24} className="text-yellow-600" />
            </div>
            <div className="text-lg font-bold text-[#333333] truncate">
              {players.length > 0 ? players[0]?.displayName : '-'}
            </div>
            <div className="text-xs text-gray-400">Current Leader</div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-[#DEDDDA] p-12 text-center">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        ) : players.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#DEDDDA] p-12 text-center">
            <CalendarCheck size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No players yet</h3>
            <p className="text-gray-500">Be the first to play Daily Quest and claim the top spot!</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-[#DEDDDA] overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-[#DEDDDA] text-xs font-medium text-gray-400 uppercase tracking-wider">
                <div className="col-span-1">Rank</div>
                <div className="col-span-5">Player</div>
                <div className="col-span-2 text-right">Rating</div>
                <div className="col-span-2 text-right">Games</div>
                <div className="col-span-2 text-right">Streak</div>
              </div>

              {currentPlayers.map((player) => {
                const tier = getRankTier(player.position);
                const isTopThree = player.position <= 3;

                return (
                  <div
                    key={player.uid}
                    className={`grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#DEDDDA]/50 last:border-0 items-center hover:bg-[#F0EFEB]/50 transition-colors ${getPositionStyle(player.position)}`}
                  >
                    <div className="col-span-1">
                      {isTopThree ? (
                        <div className="flex items-center justify-center w-8 h-8">
                          <Trophy size={20} style={{ color: tier.color }} />
                        </div>
                      ) : (
                        <span className="text-sm font-medium text-gray-500">
                          #{player.position}
                        </span>
                      )}
                    </div>

                    <div className="col-span-5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-[#DEDDDA] shrink-0">
                        <img
                          src={player.photoURL || "https://i.pinimg.com/736x/ec/49/f5/ec49f523af568d4fb71c1d771f07cb8c.jpg"}
                          alt={player.displayName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium text-sm truncate">{player.displayName}</div>
                        <div className="text-xs" style={{ color: tier.color }}>{tier.name}</div>
                      </div>
                    </div>

                    <div className="col-span-2 text-right">
                      <span className="font-mono font-bold text-[#333333]">{player.rating}</span>
                    </div>

                    <div className="col-span-2 text-right">
                      <span className="text-sm text-gray-600">{player.games}</span>
                    </div>

                    <div className="col-span-2 text-right">
                      <span className={`text-sm font-medium ${player.streak > 0 ? 'text-orange-500' : 'text-gray-600'}`}>
                        {player.streak > 0 ? `🔥 ${player.streak}` : '0'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-[#DEDDDA] text-sm font-medium hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-[#DEDDDA] text-sm font-medium hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CommunityDaily;
