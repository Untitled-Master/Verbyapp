import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { Share2, Settings, LogOut, LifeBuoy } from 'lucide-react';
import { auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

const MainNavbar = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const menuItems = [
    { icon: Settings, label: 'Settings', href: '/profile/edit' },
    { icon: LifeBuoy, label: 'Support', href: '/support' },
    { icon: LogOut, label: 'Logout', onClick: handleLogout },
  ];

  return (
    <header className="border-b border-[#DEDDDA] bg-[#F0EFEB] sticky top-0 z-50 px-6 py-4">
      <nav className="max-w-[1400px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link to="/" className="font-bold text-xl tracking-tighter text-[#EB3514] font-sans italic">VERBY.</Link>
          <div className="hidden md:flex gap-6 text-xs font-medium text-gray-500 tracking-wide">
             <Link to="/arena" className="hover:text-[#1a1a1a] transition-colors">Play</Link>
             <a href="#" className="hover:text-[#1a1a1a] transition-colors">Puzzles</a>
             <a href="#" className="hover:text-[#1a1a1a] transition-colors">Learn</a>
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
