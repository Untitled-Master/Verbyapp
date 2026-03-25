import React, { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { Chrome, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/profile');
    } catch (err) {
      setError("Authentication failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0EFEB] font-mono flex items-center justify-center p-4">
      {/* Main Container: Lichess-style centered box */}
      <div className="w-full max-w-[400px]">
        
        {/* Branding Area */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-black tracking-tighter text-[#EB3514] italic underline decoration-black underline-offset-8">
            VERBY.
          </h1>
          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
            Evolutionary Verb Mastery
          </p>
        </div>

        {/* Login Box: Brutalist Style */}
        <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
          <div className="mb-8 border-b-2 border-black pb-4">
            <h2 className="text-xl font-black uppercase italic tracking-tight">Sign In</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Access your performance data</p>
          </div>

          <div className="space-y-4">
            {/* Custom Google Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full group relative flex items-center justify-between bg-white border-2 border-black p-4 hover:bg-black hover:text-white transition-all active:translate-y-1 active:shadow-none disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <Chrome size={20} className="group-hover:rotate-12 transition-transform" />
                <span className="text-xs font-black uppercase tracking-widest">
                  {loading ? 'Authenticating...' : 'Enter with Google'}
                </span>
              </div>
              <ArrowRight size={18} />
            </button>

            {/* "Play as Guest" - Mimicking Lichess's accessibility */}
            <button 
              onClick={() => navigate('/practice')}
              className="w-full flex items-center justify-center gap-2 p-2 text-[10px] font-black uppercase tracking-tighter text-gray-400 hover:text-black transition-colors"
            >
              <Zap size={12}/> Practice as guest
            </button>

            {error && (
              <div className="bg-[#EB3514] text-white p-3 text-[10px] font-black uppercase text-center border-2 border-black animate-shake">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Security / Info Footer */}
        <div className="mt-12 grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center text-center p-4 border-2 border-black/5">
                <ShieldCheck size={20} className="text-gray-400 mb-2"/>
                <span className="text-[8px] font-black uppercase text-gray-400 leading-tight">Secure Firebase<br/>Authentication</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 border-2 border-black/5">
                <div className="font-black text-lg text-gray-400 mb-1">2k+</div>
                <span className="text-[8px] font-black uppercase text-gray-400 leading-tight">Active<br/>Conjugators</span>
            </div>
        </div>

        <p className="text-[9px] text-gray-400 text-center mt-8 uppercase font-black tracking-widest">
          Verby is Open Source // <a href="#" className="underline hover:text-[#EB3514]">Terms</a> // <a href="#" className="underline hover:text-[#EB3514]">Privacy</a>
        </p>
      </div>

      {/* Decorative background elements (Lichess often has subtle grid/patterns) */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[-1]" 
           style={{ backgroundImage: `radial-gradient(#000 1px, transparent 1px)`, size: '20px 20px' }} />
    </div>
  );
};

export default Login;