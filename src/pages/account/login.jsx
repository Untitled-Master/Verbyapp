import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Zap, Trophy, ArrowRight } from 'lucide-react';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen font-mono relative bg-[#F0EFEB] text-[#333333] flex flex-col overflow-hidden">
      {/* Decorative background watermark - Bottom Right for Login */}
      <div className="absolute -bottom-16 -right-16 text-[#EB3514] opacity-[0.03] pointer-events-none select-none text-right">
        <h1 className="text-[20rem] font-black leading-none uppercase">VERBY</h1>
      </div>

      <header className="relative z-10 border-b border-[#DEDDDA]">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-2 shrink-0 font-bold text-2xl tracking-tighter text-[#EB3514] font-sans">
            VERBY.
          </Link>
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Sign in
          </div>
        </nav>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center px-8 py-12 relative z-10 gap-16 lg:gap-24">
        
        {/* Left Side: Welcome back info (Desktop Only) */}
        <div className="hidden lg:flex flex-col max-w-sm">
            <div className="mb-6 bg-white w-12 h-12 rounded-xl flex items-center justify-center border border-[#DEDDDA] shadow-sm">
                <Trophy className="text-[#EB3514]" size={24} />
            </div>
            <h2 className="text-3xl font-bold font-sans tracking-tight mb-6">
                Resume your streak.
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-10">
                Sign in to access your mistake logs, challenge your friends in ranked duels, and continue your journey to French mastery.
            </p>
            
            <div className="pt-8 border-t border-[#DEDDDA]">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Learning partners</p>
                <div className="grid grid-cols-2 gap-y-6 opacity-40 grayscale brightness-0">
                    <span className="font-black text-xs">SORBONNE</span>
                    <span className="font-black text-xs">ENS_ULM</span>
                    <span className="font-black text-xs">McGILL</span>
                    <span className="font-black text-xs">ALLIANCE_FR</span>
                </div>
            </div>
        </div>

        {/* Right Side: The Login Card */}
        <div className="w-full max-w-md animate-fade-in-blur">
          <div className="bg-[#F0EFEB] border border-[#DEDDDA] rounded-2xl p-8 shadow-sm relative">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-[#333333] mb-1 font-sans">
                Welcome back
                </h1>
                <p className="text-xs text-gray-500 font-medium">
                Enter your credentials to access your dashboard.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-[10px] font-black text-[#333333] mb-1.5 uppercase tracking-widest">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jean@example.com"
                  className="w-full px-4 py-3 bg-white border border-[#DEDDDA] rounded-lg text-sm placeholder:text-gray-300 focus:outline-none focus:border-[#EB3514] focus:ring-1 focus:ring-[#EB3514] transition-all font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-[10px] font-black text-[#333333] uppercase tracking-widest">
                    Password
                  </label>
                  <Link to="/forgot-password" size={10} className="text-[10px] text-[#EB3514] hover:underline font-black uppercase tracking-tighter">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-white border border-[#DEDDDA] rounded-lg text-sm placeholder:text-gray-300 focus:outline-none focus:border-[#EB3514] focus:ring-1 focus:ring-[#EB3514] transition-all pr-12 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#EB3514] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#EB3514] hover:bg-[#EB3514]/90 text-white font-bold rounded-lg h-12 flex items-center justify-center transition-all shadow-sm mt-2 gap-2"
              >
                Sign in
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#DEDDDA]"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-tighter font-black">
                  <span className="px-4 bg-[#F0EFEB] text-gray-400">or identity provider</span>
                </div>
              </div>

              <button className="w-full mt-4 bg-[#F0EFEB] hover:bg-gray-200 text-[#333333] border border-[#DEDDDA] font-bold rounded-lg h-12 flex items-center justify-center gap-3 transition-all shadow-sm">
                <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-4 h-4" alt="Google" />
                Google
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-8 font-medium tracking-tight">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#EB3514] hover:underline font-bold transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </main>

      {/* Auth Footer */}
      <footer className="py-6 px-8 border-t border-[#DEDDDA] text-center lg:text-left">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-4 text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em]">
            <p>© 2026 Verby · Secure Auth Layer</p>
            <div className="flex gap-6">
                <a href="#" className="hover:text-[#EB3514]">Legal</a>
                <a href="#" className="hover:text-[#EB3514]">Privacy Policy</a>
                <a href="#" className="hover:text-[#EB3514]">Report Issue</a>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;