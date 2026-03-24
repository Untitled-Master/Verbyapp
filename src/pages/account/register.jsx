import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Zap, CheckCircle2 } from 'lucide-react';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
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
      {/* Decorative background watermark - Matching Zernio style */}
      <div className="absolute -bottom-16 -left-16 text-[#EB3514] opacity-[0.03] pointer-events-none select-none">
        <h1 className="text-[20rem] font-black leading-none">VERBY</h1>
      </div>

      <header className="relative z-10 border-b border-[#DEDDDA]">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-2 shrink-0 font-bold text-2xl tracking-tighter text-[#EB3514] font-sans">
            VERBY.
          </Link>
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Phase 1: Registration
          </div>
        </nav>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center px-8 py-12 relative z-10 gap-16">
        
        {/* Left Side: Value Proposition (Desktop Only) */}
        <div className="hidden lg:flex flex-col max-w-sm">
            <h2 className="text-3xl font-bold font-sans tracking-tight mb-6">
                Join the next generation of French learners.
            </h2>
            <ul className="space-y-4 mb-10">
                <li className="flex gap-3 text-sm text-gray-500 items-start">
                    <CheckCircle2 className="text-[#EB3514] shrink-0" size={18} />
                    <span>Access to all 12,000+ verb puzzles.</span>
                </li>
                <li className="flex gap-3 text-sm text-gray-500 items-start">
                    <CheckCircle2 className="text-[#EB3514] shrink-0" size={18} />
                    <span>Real-time duels with global matchmaking.</span>
                </li>
                <li className="flex gap-3 text-sm text-gray-500 items-start">
                    <CheckCircle2 className="text-[#EB3514] shrink-0" size={18} />
                    <span>Personalized mistake-tracking logs.</span>
                </li>
            </ul>
            
            <div className="pt-8 border-t border-[#DEDDDA]">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Trusted by students at</p>
                <div className="grid grid-cols-2 gap-4 opacity-40 grayscale brightness-0">
                    <span className="font-black text-xs">SORBONNE</span>
                    <span className="font-black text-xs">McGILL</span>
                </div>
            </div>
        </div>

        {/* Right Side: The Form */}
        <div className="w-full max-w-md animate-fade-in-blur">
          <div className="bg-[#F0EFEB] border border-[#DEDDDA] rounded-2xl p-8 shadow-sm relative">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-[#333333] mb-1 font-sans">
                Create account
                </h1>
                <p className="text-xs text-gray-500 font-medium">
                Free forever. Open-source. No credit card.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-[10px] font-black text-[#333333] mb-1.5 uppercase tracking-widest">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Jean Dupont"
                  className="w-full px-4 py-3 bg-white border border-[#DEDDDA] rounded-lg text-sm placeholder:text-gray-300 focus:outline-none focus:border-[#EB3514] focus:ring-1 focus:ring-[#EB3514] transition-all"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-[10px] font-black text-[#333333] mb-1.5 uppercase tracking-widest">
                  Work Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jean@example.com"
                  className="w-full px-4 py-3 bg-white border border-[#DEDDDA] rounded-lg text-sm placeholder:text-gray-300 focus:outline-none focus:border-[#EB3514] focus:ring-1 focus:ring-[#EB3514] transition-all"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-[10px] font-black text-[#333333] mb-1.5 uppercase tracking-widest">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-white border border-[#DEDDDA] rounded-lg text-sm placeholder:text-gray-300 focus:outline-none focus:border-[#EB3514] focus:ring-1 focus:ring-[#EB3514] transition-all pr-12"
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
                className="w-full bg-[#EB3514] hover:bg-[#EB3514]/90 text-white font-bold rounded-lg h-12 flex items-center justify-center transition-all shadow-sm mt-2"
              >
                Sign up
              </button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#DEDDDA]"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-tighter">
                  <span className="px-4 bg-[#F0EFEB] text-gray-400 font-bold">or continue with</span>
                </div>
              </div>

              <button className="w-full mt-4 bg-[#F0EFEB] hover:bg-gray-200 text-[#333333] border border-[#DEDDDA] font-bold rounded-lg h-12 flex items-center justify-center gap-3 transition-all shadow-sm">
                <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-4 h-4" alt="Google" />
                Google
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-8 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-[#EB3514] hover:underline font-bold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </main>

      {/* Mini Footer for Register page */}
      <footer className="py-6 px-8 border-t border-[#DEDDDA] text-center lg:text-left">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-4 text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em]">
            <p>© 2026 Verby — The open source verb engine</p>
            <div className="flex gap-6">
                <a href="#" className="hover:text-[#EB3514]">Terms</a>
                <a href="#" className="hover:text-[#EB3514]">Privacy</a>
                <a href="#" className="hover:text-[#EB3514]">Support</a>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Register;