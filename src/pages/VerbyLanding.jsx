import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Trophy, Users, Zap, Brain, History, BookOpen, Star, Github, Globe, BarChart3, Target, Swords } from 'lucide-react';

const VerbyLanding = () => {
  return (
    /* Changed bg-[#FDFCF8] to bg-[#F0EFEB] */
    <div className="min-h-screen font-mono relative bg-[#F0EFEB] text-[#333333]">
      <Navbar />

      <main className="relative z-10">
        {/* HERO SECTION */}
        <div className="max-w-xl lg:max-w-3xl mx-auto px-8 pt-12 lg:pt-24 text-left">
          <div className="mb-8 lg:mb-10 animate-fade-in-blur">
            <a href="#" className="text-xs lg:text-sm text-[#EB3514] hover:text-[#EB3514]/80 transition-colors flex items-center gap-1 font-bold">
              New: Multi-player duels are now live <span className="ml-1">→</span>
            </a>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-5 lg:mb-8 text-[#333333] animate-fade-in-blur [animation-delay:0.1s]">
            Master French verbs through play.
          </h1>

          <p className="text-base lg:text-xl mb-7 lg:mb-10 text-gray-500 animate-fade-in-blur [animation-delay:0.2s] leading-relaxed">
            Conjugation doesn't have to be a chore. Solve puzzles, challenge friends, and learn from your mistakes. Free, open-source, and actually fun.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 mb-4 lg:mb-6 animate-fade-in-blur [animation-delay:0.3s]">
            <Link to="/login" className="bg-[#EB3514] hover:bg-[#EB3514]/90 text-white font-bold rounded-md h-12 px-6 flex items-center justify-center transition-all shadow-sm">
              Start playing
            </Link>
            {/* Changed bg-white to bg-[#F0EFEB] */}
            <button className="bg-[#F0EFEB] hover:bg-gray-200 text-[#333333] border border-[#DEDDDA] font-bold rounded-md h-12 px-6 flex items-center justify-center gap-3 transition-all shadow-sm">
               <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-5 h-5" alt="Google" />
               Continue with Google
            </button>
          </div>
          <p className="text-xs lg:text-sm text-gray-400 mb-8 lg:mb-12 animate-fade-in-blur [animation-delay:0.4s]">No credit card. No ads. Just verbs.</p>

          {/* PUZZLE VISUAL WINDOW */}
          <div className="mb-16 lg:mb-24 animate-fade-in-blur [animation-delay:0.5s]">
            <div className="rounded-lg lg:rounded-xl overflow-hidden shadow-2xl bg-[#1a1a1a] border border-[#333]">
              <div className="px-4 py-2 lg:py-3 flex items-center justify-between bg-[#161616] border-b border-[#333]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-xs text-gray-500 ml-2 italic font-mono uppercase tracking-tighter">Ranked Duel #402</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-[#EB3514] font-bold text-coral">12s REMAINING</span>
                    <span className="text-xs text-gray-600 uppercase tracking-widest">Level 14</span>
                </div>
              </div>
              <div className="p-8 lg:p-12 text-center bg-gradient-to-b from-[#1a1a1a] to-[#111]">
                <div className="text-gray-500 text-[10px] mb-4 uppercase tracking-[0.2em] font-bold">Conjugate the verb:</div>
                <div className="text-3xl lg:text-4xl text-white font-bold mb-8 font-sans">
                    Nous <span className="text-[#EB3514] border-b-2 border-[#EB3514] px-2">_______</span> (Vouloir)
                </div>
                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                    {['voulons', 'voulions', 'voulez', 'voulaient'].map((option, i) => (
                        <div key={i} className={`p-3 rounded border text-sm font-bold cursor-pointer transition-all ${i === 0 ? 'bg-[#EB3514] border-[#EB3514] text-white' : 'border-[#333] text-gray-400 hover:border-gray-500 hover:text-white'}`}>
                            {option}
                        </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LOGO CLOUD */}
        {/* Changed bg-[#F8F7F2]/50 to bg-[#F0EFEB] */}
        <section className="py-16 border-t border-[#DEDDDA] bg-[#F0EFEB]">
            <div className="max-w-6xl mx-auto px-8">
                <p className="text-xs w-full text-center text-gray-400 mb-8 font-bold uppercase tracking-widest">Loved by learners at</p>
                <div className="max-w-3xl mx-auto grid grid-cols-3 sm:grid-cols-6 gap-8 items-center opacity-30 grayscale brightness-0">
                    {['SORBONNE', 'ALLIANCE', 'McGILL', 'ENS', 'HEC', 'CAMPUS'].map(uni => (
                        <div key={uni} className="text-center font-black text-lg tracking-tighter">{uni}</div>
                    ))}
                </div>
            </div>
        </section>

        <div className="max-w-xl lg:max-w-3xl mx-auto px-8 py-24">
          
          {/* THE MODES SECTION */}
          <div className="mb-24">
            <h2 className="inline-flex items-center text-xs font-mono tracking-wider uppercase rounded-sm px-1 py-0.5 bg-[#EB3514]/[0.08] border border-[#EB3514]/15 text-[#EB3514] mb-8">
              Game Modes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <ModeCard 
                    icon={<Zap className="text-[#EB3514]"/>} 
                    title="Blitz" 
                    desc="60 seconds. How many verbs can you conjugate correctly? The ultimate test of muscle memory."
                />
                <ModeCard 
                    icon={<Swords className="text-[#EB3514]"/>} 
                    title="Ranked Duels" 
                    desc="Climb the global ladder. Compete head-to-head in real-time against players at your skill level."
                />
                <ModeCard 
                    icon={<Brain className="text-[#EB3514]"/>} 
                    title="Mistake Mastery" 
                    desc="Verby tracks every error. This mode intelligently cycles back to the verbs you find hardest."
                />
                <ModeCard 
                    icon={<Target className="text-[#EB3514]"/>} 
                    title="Daily Quest" 
                    desc="A curated set of 10 puzzles every day. Maintain your streak and unlock new profile themes."
                />
            </div>
          </div>

          {/* HOW IT WORKS */}
          <div className="mb-24">
            <h2 className="inline-flex items-center text-xs font-mono tracking-wider uppercase rounded-sm px-1 py-0.5 bg-[#EB3514]/[0.08] border border-[#EB3514]/15 text-[#EB3514] mb-8">
                How It Works
            </h2>
            <ol className="space-y-12">
                <li className="flex gap-x-6">
                    <span className="text-xl text-gray-400/50 font-bold font-mono">01.</span>
                    <div>
                        <div className="font-bold text-lg text-[#333333] mb-1">Pick your battleground.</div>
                        <div className="text-gray-500 leading-relaxed">Choose a specific verb group (-er, -ir, -re) or dive into complex moods like the Subjunctive.</div>
                    </div>
                </li>
                <li className="flex gap-x-6">
                    <span className="text-xl text-gray-400/50 font-bold font-mono">02.</span>
                    <div>
                        <div className="font-bold text-lg text-[#333333] mb-1">Engage in rapid-fire puzzles.</div>
                        <div className="text-gray-500 leading-relaxed">Input answers via keyboard or choice. Verby's engine provides instant feedback on stem and ending errors.</div>
                    </div>
                </li>
                <li className="flex gap-x-6">
                    <span className="text-xl text-gray-400/50 font-bold font-mono">03.</span>
                    <div>
                        <div className="font-bold text-lg text-[#333333] mb-1">Level up your intuition.</div>
                        <div className="text-gray-500 leading-relaxed">Stop thinking about grammar rules. Through repetition and play, conjugation becomes a reflex.</div>
                    </div>
                </li>
            </ol>
          </div>

          {/* THE STACK */}
          <div className="mb-24">
            <h2 className="inline-flex items-center text-xs font-mono tracking-wider uppercase rounded-sm px-1 py-0.5 bg-[#EB3514]/[0.08] border border-[#EB3514]/15 text-[#EB3514] mb-8">
                The Feature Stack
            </h2>
            <div className="space-y-3">
                <FeatureRow label="SOCIAL" title="Friend Invites" desc="Send a unique room link and start a private duel instantly." />
                <FeatureRow label="DATA" title="Mistake Logs" desc="A detailed history of every verb you've missed and why." />
                <FeatureRow label="GLOBAL" title="Leaderboards" desc="See where you stand against the world's most dedicated learners." />
                <FeatureRow label="ENGINE" title="12,000+ Verbs" desc="From 'Aimer' to 'Zonner'. Our engine supports every known verb." />
                <FeatureRow label="OPEN" title="Open Source" desc="Contribute to the curriculum or build your own client." />
            </div>
          </div>

          {/* FAQ SECTION */}
          <div className="mb-24">
            <h2 className="inline-flex items-center text-xs font-mono tracking-wider uppercase rounded-sm px-1 py-0.5 bg-[#EB3514]/[0.08] border border-[#EB3514]/15 text-[#EB3514] mb-8">
                Frequently Asked Questions
            </h2>
            <dl className="space-y-8">
                <div>
                    <dt className="font-bold text-sm text-[#333333]">Is Verby actually free?</dt>
                    <dd className="mt-1 grid grid-cols-[auto_1fr] gap-x-2">
                        <span className="text-gray-400">└</span>
                        <span className="text-sm text-gray-500">Yes. Verby is an open-source project. No ads, no subscriptions, no paywalls.</span>
                    </dd>
                </div>
                <div>
                    <dt className="font-bold text-sm text-[#333333]">Can I practice specific tenses?</dt>
                    <dd className="mt-1 grid grid-cols-[auto_1fr] gap-x-2">
                        <span className="text-gray-400">└</span>
                        <span className="text-sm text-gray-500">Absolutely. You can filter puzzles by tense (e.g., only Passé Composé) or mood (only Subjunctive).</span>
                    </dd>
                </div>
                <div>
                    <dt className="font-bold text-sm text-[#333333]">How do the duels work?</dt>
                    <dd className="mt-1 grid grid-cols-[auto_1fr] gap-x-2">
                        <span className="text-gray-400">└</span>
                        <span className="text-sm text-gray-500">Players get the same sequence of verbs. Points are awarded for accuracy and speed. First one to finish wins.</span>
                    </dd>
                </div>
                <div>
                    <dt className="font-bold text-sm text-[#333333]">Is there a mobile app?</dt>
                    <dd className="mt-1 grid grid-cols-[auto_1fr] gap-x-2">
                        <span className="text-gray-400">└</span>
                        <span className="text-sm text-gray-500">Verby is a PWA (Progressive Web App). You can 'Add to Home Screen' for a full-screen mobile experience.</span>
                    </dd>
                </div>
            </dl>
          </div>

          {/* FINAL CTA */}
          <section className="py-12 text-center border-t border-[#DEDDDA]">
            <p className="text-sm mb-2 text-[#333333] font-bold">Ready to master the verbs?</p>
            <p className="text-sm mb-8 text-gray-400">Join 5,000+ students learning the right way.</p>
            <Link to="/login" className="bg-[#EB3514] text-white px-10 py-4 rounded-md font-bold text-sm hover:bg-[#EB3514]/90 transition-all shadow-sm">
                Get started for free
            </Link>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
};

// Sub-components updated with #F0EFEB
const ModeCard = ({ icon, title, desc }) => (
    /* Changed bg-white to bg-[#F0EFEB] */
    <div className="p-6 bg-[#F0EFEB] border border-[#DEDDDA] rounded-xl shadow-sm hover:border-[#EB3514]/30 transition-all group">
        <div className="mb-4 bg-[#F0EFEB] w-10 h-10 rounded-lg flex items-center justify-center border border-[#DEDDDA] group-hover:scale-110 transition-transform text-[#EB3514]">
            {icon}
        </div>
        <h3 className="font-bold text-[#333333] mb-2">{title}</h3>
        <p className="text-xs text-gray-500 leading-relaxed font-medium">{desc}</p>
    </div>
);

const FeatureRow = ({ label, title, desc }) => (
    /* Changed bg-white to bg-[#F0EFEB] */
    <div className="flex items-center gap-4 p-4 bg-[#F0EFEB] border border-[#DEDDDA] rounded-lg hover:bg-[#EAE9E4] transition-colors cursor-default">
        <span className="text-[9px] font-black tracking-widest text-[#EB3514] bg-[#EB3514]/10 px-2 py-1 rounded uppercase min-w-[70px] text-center">
            {label}
        </span>
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
            <span className="text-sm font-bold text-[#333333] whitespace-nowrap">{title}</span>
            <span className="hidden md:block text-gray-300">|</span>
            <span className="text-xs text-gray-400 leading-none font-medium">{desc}</span>
        </div>
    </div>
);

export default VerbyLanding;