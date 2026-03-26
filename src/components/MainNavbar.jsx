import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { Share2, Settings, LogOut, LifeBuoy, User, ChevronDown, Search, X } from 'lucide-react';
import { auth, database } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

const gameModes = [
  { id: 'blitz', name: 'Blitz', href: '/community/blitz', color: '#333333' },
  { id: 'streak', name: 'Streak', href: '/community/streak', color: '#EB3514' },
  { id: 'duels', name: 'Duels', href: '/community/duels', color: '#C0C0C0' },
  { id: 'daily', name: 'Daily', href: '/community/daily', color: '#6366F1' },
];

const MainNavbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef(null);
  const communityRef = useRef(null);
  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (communityRef.current && !communityRef.current.contains(event.target)) {
        setIsCommunityOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]);
        setIsSearching(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchUsers = useCallback(async (searchTerm) => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const users = [];
        const searchLower = searchTerm.toLowerCase();
        
        snapshot.forEach((child) => {
          const data = child.val();
          const displayName = data.profile?.displayName || '';
          
          if (displayName.toLowerCase().includes(searchLower)) {
            users.push({
              uid: child.key,
              displayName: data.profile?.displayName,
              photoURL: data.profile?.photoURL,
              stats: data.stats,
            });
          }
        });

        setSearchResults(users.slice(0, 5));
      }
    } catch (error) {
      console.error('Search error:', error);
    }
    setIsSearching(false);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        searchUsers(value);
      }, 300);
    } else {
      setSearchResults([]);
    }
  };

  const handleResultClick = (uid) => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
    navigate(`/profile/${uid}`);
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const menuItems = [
    { icon: User, label: 'Profile', href: '/profile'}, 
    { icon: Settings, label: 'Settings', href: '/profile/edit' },
    { icon: LifeBuoy, label: 'Support', href: '/support' },
    { icon: LogOut, label: 'Logout', onClick: handleLogout },
  ];

  const getTopMode = (stats) => {
    if (!stats) return null;
    let topMode = null;
    let topRating = 0;
    
    Object.entries(stats).forEach(([mode, data]) => {
      if (data.rating && data.rating > topRating) {
        topRating = data.rating;
        topMode = mode;
      }
    });
    
    return topMode ? { mode: topMode, rating: topRating } : null;
  };

  return (
    <header className="border-b border-[#DEDDDA] bg-[#F0EFEB] sticky top-0 z-50 px-6 py-4">
      <nav className="max-w-[1400px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link to="/arena" className="font-bold text-xl tracking-tighter text-[#EB3514] font-sans italic">VERBY.</Link>
          <div className="hidden md:flex gap-6 text-xs font-medium text-gray-500 tracking-wide">
             <Link to="/arena" className="hover:text-[#1a1a1a] transition-colors">Play</Link>
             <div className="relative" ref={communityRef}>
               <button 
                 onClick={() => setIsCommunityOpen(!isCommunityOpen)}
                 className="flex items-center gap-1 hover:text-[#1a1a1a] transition-colors"
               >
                 Community
                 <ChevronDown size={12} className={`transition-transform ${isCommunityOpen ? 'rotate-180' : ''}`} />
               </button>
               {isCommunityOpen && (
                 <div className="absolute top-full left-0 mt-2 w-40 bg-white rounded-xl border border-[#DEDDDA] shadow-lg py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                   {gameModes.map((mode) => (
                     <Link 
                       key={mode.id}
                       to={mode.href}
                       onClick={() => setIsCommunityOpen(false)}
                       className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-[#F0EFEB] transition-colors"
                     >
                       <span 
                         className="w-2 h-2 rounded-full" 
                         style={{ backgroundColor: mode.color }}
                       />
                       {mode.name}
                     </Link>
                   ))}
                 </div>
               )}
             </div>
             <a href="#" className="hover:text-[#1a1a1a] transition-colors">Puzzles</a>
             <a href="#" className="hover:text-[#1a1a1a] transition-colors">Learn</a>
          </div>
        </div>
        
        <div className="hidden md:block">
          <div className="relative" ref={searchRef}>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery.length >= 2 && searchUsers(searchQuery)}
                placeholder="Search players..."
                className="w-64 pl-9 pr-8 py-2 text-sm rounded-xl border border-[#DEDDDA] bg-white focus:outline-none focus:border-[#EB3514] focus:ring-1 focus:ring-[#EB3514] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-[#DEDDDA] shadow-lg py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                {searchResults.map((result) => {
                  const topMode = getTopMode(result.stats);
                  return (
                    <button
                      key={result.uid}
                      onClick={() => handleResultClick(result.uid)}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#F0EFEB] transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-[#DEDDDA] shrink-0">
                        <img
                          src={result.photoURL || "https://i.pinimg.com/736x/ec/49/f5/ec49f523af568d4fb71c1d771f07cb8c.jpg"}
                          alt={result.displayName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{result.displayName}</p>
                        {topMode && (
                          <p className="text-xs text-gray-400">{topMode.rating} ELO</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            
            {isSearching && searchQuery.length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-[#DEDDDA] shadow-lg py-4 px-4 text-sm text-gray-500">
                Searching...
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Share2 size={18} />
          </button>
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-[#DEDDDA] hover:ring-[#EB3514] transition-all"
            >
              <img 
                src={user?.photoURL && user.photoURL.trim() ? user.photoURL : "https://i.pinimg.com/736x/ec/49/f5/ec49f523af568d4fb71c1d771f07cb8c.jpg"} 
                alt={user?.displayName || 'Profile'} 
                className="w-full h-full object-cover"
              />
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-[#DEDDDA] shadow-lg py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 border-b border-[#DEDDDA]">
                  <p className="text-sm font-medium truncate">{user?.displayName || 'User'}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
                <div className="py-1">
                  {menuItems.map((item, index) => (
                    item.href ? (
                      <Link 
                        key={index}
                        to={item.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-[#F0EFEB] transition-colors"
                      >
                        <item.icon size={16} className="text-gray-400" />
                        {item.label}
                      </Link>
                    ) : (
                      <button 
                        key={index}
                        onClick={() => {
                          item.onClick();
                          setIsOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-[#F0EFEB] transition-colors"
                      >
                        <item.icon size={16} className="text-gray-400" />
                        {item.label}
                      </button>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default MainNavbar;
