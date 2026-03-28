import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue, query, orderByChild } from 'firebase/database';
import { database } from '../../lib/firebase';
import MainNavbar from '../../components/MainNavbar';
import { Brain } from 'lucide-react';

const GOLD_TROPHY_IMG = 'https://lichess1.org/assets/hashed/gold-cup-2.e1e2ac3f.png';
const SILVER_TROPHY_IMG = 'https://lichess1.org/assets/hashed/silver-cup-2.d820d24e.png';

const CommunitySDL = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const playersPerPage = 20;

  useEffect(() => {
    const leaderboardRef = query(
      ref(database, 'users'),
      orderByChild('stats/sdl/rating'),
    );

    const unsubscribe = onValue(leaderboardRef, (snapshot) => {
      if (snapshot.exists()) {
        const users = [];
        snapshot.forEach((child) => {
          const data = child.val();
          const stats = data.stats?.sdl;
          if (stats && stats.games > 0) {
            users.push({
              uid: child.key,
              displayName: data.profile?.displayName || 'Anonymous',
              photoURL: data.profile?.photoURL || '',
              rating: stats.rating || 1200,
              games: stats.games || 0,
              wins: stats.wins || 0,
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
    if (position === 1) return { name: 'Champion', color: '#FFD700' };
    if (position === 2) return { name: 'Grandmaster', color: '#C0C0C0' };
    if (position === 3) return { name: 'Master', color: '#CD7F32' };
    if (position <= 10) return { name: 'Diamond', color: '#6366F1' };
    if (position <= 50) return { name: 'Platinum', color: '#14B8A6' };
    if (position <= 100) return { name: 'Gold', color: '#EAB308' };
    if (position <= 250) return { name: 'Silver', color: '#9CA3AF' };
    return { name: 'Bronze', color: '#92400E' };
  };

  const indexOfLastPlayer = currentPage * playersPerPage;
  const indexOfFirstPlayer = indexOfLastPlayer - playersPerPage;
  const currentPlayers = players.slice(indexOfFirstPlayer, indexOfLastPlayer);
  const totalPages = Math.ceil(players.length / playersPerPage);

  return (
    <div className="min-h-screen font-mono bg-[#F0EFEB] text-[#333333]">
      <MainNavbar />

      <div className="max-w-4xl mx-auto px-4 py-6 md:px-6 md:py-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#059669] flex items-center justify-center">
            <Brain size={16} className="md:size-5 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">SDL Blitz</h1>
        </div>
        <p className="text-xs md:text-sm text-gray-500 mb-6 md:mb-8">Top SDL conjugation masters ranked by rating</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-8">
          <div className="px-3 md:px-5 py-2 md:py-3 bg-[#F0EFEB] border border-[#DEDDDA] rounded-md flex items-center gap-2 md:gap-3">
            <span className="text-lg md:text-2xl font-bold">{players.length}</span>
            <span className="text-[9px] md:text-xs text-gray-500 uppercase tracking-wide">Players</span>
          </div>
          <div className="px-3 md:px-5 py-2 md:py-3 bg-[#F0EFEB] border border-[#DEDDDA] rounded-md flex items-center gap-2 md:gap-3">
            <span className="text-lg md:text-2xl font-bold">{players[0]?.rating || '-'}</span>
            <span className="text-[9px] md:text-xs text-gray-500 uppercase tracking-wide">Top ELO</span>
          </div>
          {players[0] && (
            <Link 
              to={`/profile/${players[0].uid}`}
              className="col-span-2 md:col-span-1 px-3 md:px-5 py-2 md:py-3 bg-[#059669] text-white rounded-md flex items-center gap-2 hover:bg-[#059669]/90 transition-colors"
            >
              <img src={GOLD_TROPHY_IMG} alt="trophy" className="w-5 h-5 md:w-6 md:h-6 object-contain brightness-0 invert" />
              <div>
                <div className="text-[9px] md:text-xs text-white/80 uppercase tracking-wide">Leader</div>
                <div className="text-xs md:text-sm font-bold truncate">{players[0].displayName}</div>
              </div>
            </Link>
          )}
        </div>

        {loading ? (
          <div className="bg-[#F0EFEB] border border-[#DEDDDA] rounded-lg p-4 md:p-6">
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 md:h-14 bg-white border border-[#DEDDDA] rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        ) : players.length === 0 ? (
          <div className="bg-[#F0EFEB] border border-[#DEDDDA] rounded-lg p-8 md:p-12 text-center">
            <p className="text-gray-500">No players yet</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block bg-[#F0EFEB] border border-[#DEDDDA] rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-[#DEDDDA] bg-white">
                <div className="col-span-1 text-xs font-bold text-gray-500 uppercase tracking-wider">#</div>
                <div className="col-span-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Player</div>
                <div className="col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">ELO</div>
                <div className="col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Games</div>
                <div className="col-span-1 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">W%</div>
              </div>

              {currentPlayers.map((player) => {
                const tier = getRankTier(player.position);

                return (
                  <Link
                    key={player.uid}
                    to={`/profile/${player.uid}`}
                    className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-[#DEDDDA]/30 last:border-0 bg-white hover:bg-[#F0EFEB] transition-colors"
                  >
                    <div className="col-span-1 flex items-center">
                      {player.position === 1 ? (
                        <img src={GOLD_TROPHY_IMG} alt="trophy" className="w-5 h-5 object-contain" />
                      ) : player.position <= 10 ? (
                        <img src={SILVER_TROPHY_IMG} alt="trophy" className="w-5 h-5 object-contain" />
                      ) : (
                        <span className="text-xs font-medium text-gray-400">{player.position}</span>
                      )}
                    </div>

                    <div className="col-span-6 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-[#DEDDDA] shrink-0">
                        <img
                          src={player.photoURL || "https://i.pinimg.com/736x/ec/49/f5/ec49f523af568d4fb71c1d771f07cb8c.jpg"}
                          alt={player.displayName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{player.displayName}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wide">{tier.name}</span>
                      </div>
                    </div>

                    <div className="col-span-2 flex items-center justify-end">
                      <span className="text-sm font-bold">{player.rating}</span>
                    </div>

                    <div className="col-span-2 flex items-center justify-end">
                      <span className="text-sm text-gray-600">{player.games}</span>
                    </div>

                    <div className="col-span-1 flex items-center justify-end">
                      <span className={`text-xs font-medium ${player.games > 0 && (player.wins / player.games) >= 0.5 ? 'text-green-600' : 'text-gray-400'}`}>
                        {player.games > 0 ? Math.round((player.wins / player.games) * 100) : 0}%
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="md:hidden space-y-2">
              {currentPlayers.map((player) => {
                const tier = getRankTier(player.position);

                return (
                  <Link
                    key={player.uid}
                    to={`/profile/${player.uid}`}
                    className="block bg-white border border-[#DEDDDA] rounded-lg p-3 hover:bg-[#F0EFEB] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-[#DEDDDA] shrink-0 bg-[#F0EFEB]">
                          {player.photoURL ? (
                            <img
                              src={player.photoURL}
                              alt={player.displayName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">
                              {player.displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {player.position === 1 ? (
                              <img src={GOLD_TROPHY_IMG} alt="trophy" className="w-4 h-4 object-contain" />
                            ) : player.position <= 10 ? (
                              <img src={SILVER_TROPHY_IMG} alt="trophy" className="w-4 h-4 object-contain" />
                            ) : (
                              <span className="text-xs font-medium text-gray-400 w-4">#{player.position}</span>
                            )}
                            <span className="text-sm font-medium truncate">{player.displayName}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-[10px] text-gray-400 uppercase tracking-wide">{tier.name}</span>
                            <span className="text-[10px] text-gray-400">{player.games} games</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <div className="text-base font-bold">{player.rating}</div>
                        <div className={`text-[10px] ${player.games > 0 && (player.wins / player.games) >= 0.5 ? 'text-green-600' : 'text-gray-400'}`}>
                          {player.games > 0 ? Math.round((player.wins / player.games) * 100) : 0}%
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 md:px-4 py-2 text-xs md:text-sm font-bold bg-[#F0EFEB] border border-[#DEDDDA] rounded hover:bg-[#EAE9E4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Prev
                </button>
                <span className="text-xs md:text-sm text-gray-500">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 md:px-4 py-2 text-xs md:text-sm font-bold bg-[#F0EFEB] border border-[#DEDDDA] rounded hover:bg-[#EAE9E4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

export default CommunitySDL;
