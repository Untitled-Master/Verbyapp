import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { Settings, LogOut, LifeBuoy, User, ChevronDown, Search, X, Shield, Menu, Home, Users, Wrench } from 'lucide-react';
import { auth, database } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

const gameModes = [
  { id: 'blitz', name: 'Blitz', href: '/community/blitz', color: '#333333' },
  { id: 'streak', name: 'Streak', href: '/community/streak', color: '#EB3514' },
  { id: 'duels', name: 'Duels', href: '/community/duels', color: '#C0C0C0' },
  { id: 'zen', name: 'Zen', href: '/community/zen', color: '#6366F1' },
];

const MainNavbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const dropdownRef = useRef(null);
  const communityRef = useRef(null);
  const searchRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (user) {
      const profileRef = ref(database, `users/${user.uid}/profile`);
      get(profileRef).then((snapshot) => {
        if (snapshot.exists()) {
          setUserRole(snapshot.val().role || 'user');
        }
      });
    }
  }, [user]);

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
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
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
    ...(userRole === 'admin' ? [{ icon: Shield, label: 'Admin', href: '/admin' }] : []),
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
    <header className="border-b border-[#DEDDDA] bg-[#F0EFEB] sticky top-0 z-50 px-4 py-3">
      <nav className="max-w-[1400px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/arena" className="font-bold text-lg tracking-tighter text-[#EB3514] font-sans italic">VERBY.</Link>
          
          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-gray-500 tracking-wide">
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
            <Link to="/tools" className="hover:text-[#1a1a1a] transition-colors">Tools</Link>
          </div>

          <button 
            ref={mobileMenuRef}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700"
          >
            <Menu size={20} />
          </button>
        </div>
        
        <div className="hidden md:block w-64">
          <div className="relative" ref={searchRef}>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery.length >= 2 && searchUsers(searchQuery)}
                placeholder="Search players..."
                className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-[#DEDDDA] bg-white focus:outline-none focus:border-[#EB3514] focus:ring-1 focus:ring-[#EB3514] transition-all"
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
        
        <div className="flex items-center gap-2">
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

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-[#DEDDDA] shadow-lg py-4 px-4">
          <div className="mb-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Navigation</p>
            <div className="space-y-1">
              <Link 
                to="/arena" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#F0EFEB] transition-colors"
              >
                <Home size={16} className="text-gray-400" />
                <span className="text-sm font-medium">Play</span>
              </Link>
              <div className="px-3 py-2">
                <div className="flex items-center gap-3 mb-2">
                  <Users size={16} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Community</span>
                </div>
                <div className="pl-6 space-y-1">
                  {gameModes.map((mode) => (
                    <Link 
                      key={mode.id}
                      to={mode.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 py-1.5 text-sm text-gray-600 hover:text-[#1a1a1a]"
                    >
                      <span 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: mode.color }}
                      />
                      {mode.name}
                    </Link>
                  ))}
                </div>
              </div>
              <Link 
                to="/tools" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#F0EFEB] transition-colors"
              >
                <Wrench size={16} className="text-gray-400" />
                <span className="text-sm font-medium">Tools</span>
              </Link>
            </div>
          </div>
          
          <div className="border-t border-[#DEDDDA] pt-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search players..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-[#DEDDDA] bg-[#F0EFEB] focus:outline-none focus:border-[#EB3514]"
              />
            </div>
            {searchResults.length > 0 && (
              <div className="mt-2 bg-white rounded-lg border border-[#DEDDDA] py-1">
                {searchResults.map((result) => {
                  const topMode = getTopMode(result.stats);
                  return (
                    <button
                      key={result.uid}
                      onClick={() => {
                        handleResultClick(result.uid);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#F0EFEB]"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-[#F0EFEB]">
                        <img
                          src={result.photoURL || "https://i.pinimg.com/736x/ec/49/f5/ec49f523af568d4fb71c1d771f07cb8c.jpg"}
                          alt={result.displayName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{result.displayName}</p>
                        {topMode && <p className="text-xs text-gray-400">{topMode.rating} ELO</p>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default MainNavbar;
