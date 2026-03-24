import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  Zap, Trophy, Target, Flame, Settings, BarChart3, 
  Swords, Calendar, Clock, Globe, Github, Info, Mail, MapPin
} from 'lucide-react';

const Profile = () => {
  // Mock data for the multi-line chart
  const chartData = [
    { name: 'Mar 01', blitz: 1750, bullet: 1900, rapid: 1800 },
    { name: 'Mar 05', blitz: 1780, bullet: 1950, rapid: 1820 },
    { name: 'Mar 10', blitz: 1810, bullet: 1920, rapid: 1880 },
    { name: 'Mar 15', blitz: 1800, bullet: 2000, rapid: 1950 },
    { name: 'Mar 20', blitz: 1817, bullet: 2060, rapid: 1980 },
    { name: 'Today', blitz: 1817, bullet: 2047, rapid: 1987 },
  ];

  const variants = [
    { id: 'bullet', name: 'Bullet', rating: 2047, games: '2,273', rank: '54,439', color: '#EB3514', icon: <Clock size={16}/> },
    { id: 'blitz', name: 'Blitz', rating: 1817, games: '1,146', rank: '134,334', color: '#333333', icon: <Zap size={16}/> },
    { id: 'rapid', name: 'Rapid', rating: 1987, games: '71', rank: 'Top 5%', color: '#9CA3AF', icon: <Swords size={16}/> },
  ];

  const activityLog = [
    {
      date: "March 23, 2026",
      entries: [
        { icon: <Target size={16}/>, text: "Solved 3 tactical puzzles", rating: "1921", change: "-12", result: { wins: 1, losses: 2 } },
        { icon: <Zap size={16}/>, text: "Played 9 Bullet games", rating: "2047", change: "-15", result: { wins: 3, losses: 6 } },
      ]
    },
    {
      date: "March 22, 2026",
      entries: [
        { icon: <Zap size={16}/>, text: "Played 17 Blitz games", rating: "1850", change: "+32", result: { wins: 11, losses: 6 } },
      ]
    }
  ];

  return (
    <div className="min-h-screen font-mono bg-[#F0EFEB] text-[#333333] flex flex-col">
      {/* Navbar */}
      <header className="border-b border-[#DEDDDA] bg-[#F0EFEB]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-2">
        <nav className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="font-bold text-xl tracking-tighter text-[#EB3514] font-sans italic">VERBY.</Link>
            <div className="hidden md:flex gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
               <a href="#" className="hover:text-[#333333]">Play</a>
               <a href="#" className="hover:text-[#333333]">Puzzles</a>
               <a href="#" className="hover:text-[#333333]">Learn</a>
            </div>
          </div>
          <div className="w-8 h-8 rounded bg-[#EB3514] flex items-center justify-center text-white font-bold text-xs">DM</div>
        </nav>
      </header>

      <div className="flex-1 max-w-[1400px] w-full mx-auto flex flex-col lg:flex-row">
        
        {/* LEFT SIDEBAR: Variant Overview */}
        <aside className="w-full lg:w-[260px] border-r border-[#DEDDDA] p-4 flex flex-col gap-1">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-3 mb-4">Ratings</h2>
          {variants.map((v) => (
            <div key={v.id} className="flex items-start justify-between p-3 rounded bg-white shadow-sm border border-[#DEDDDA] mb-1">
              <div className="flex gap-3">
                <div style={{ color: v.color }}>{v.icon}</div>
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-tighter leading-none mb-1">{v.name}</h3>
                  <div className="text-lg font-black font-sans leading-none">{v.rating}</div>
                  <div className="text-[9px] text-gray-400 font-bold mt-1 uppercase">{v.games} games</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Rank</div>
                <div className="text-[10px] font-black leading-none">{v.rank}</div>
              </div>
            </div>
          ))}
          
          <div className="mt-6 p-4 bg-[#F8F7F2] rounded-xl border border-[#DEDDDA]">
            <h4 className="text-[10px] font-black text-[#333333] uppercase tracking-widest mb-2">Mistake Mastery</h4>
            <div className="flex justify-between text-[10px] font-bold mb-1">
                <span className="text-gray-400">Irregular Verbs</span>
                <span className="text-[#EB3514]">68%</span>
            </div>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#EB3514] w-[68%]"/>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 min-w-0 bg-white/40">
          
          {/* Bio Section */}
          <div className="p-6 lg:p-10 border-b border-[#DEDDDA]">
            <div className="flex flex-col md:flex-row gap-8 items-start">
               <div className="w-24 h-24 rounded-2xl bg-[#EB3514] flex items-center justify-center text-white font-black text-4xl shadow-xl shrink-0">DM</div>
               <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-4xl font-black font-sans tracking-tighter text-[#333333]">DzooMaster</h1>
                        <div className="flex gap-4 mt-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            <span className="flex items-center gap-1 text-[#333333]"><MapPin size={12}/> Algeria</span>
                            <span className="flex items-center gap-1"><Globe size={12}/> French & Arabic</span>
                            <span className="text-[#EB3514]">Member since 2023</span>
                        </div>
                    </div>
                    <button className="p-2 border border-[#DEDDDA] rounded-lg hover:bg-white transition-all"><Settings size={18}/></button>
                  </div>
                  <div className="bg-white/50 p-4 rounded-xl border border-[#DEDDDA] relative">
                    <div className="absolute -top-2 left-4 px-2 bg-[#F0EFEB] text-[9px] font-black text-gray-400 tracking-widest uppercase">Bio</div>
                    <p className="text-sm text-gray-600 leading-relaxed font-medium">
                        Passionné par la langue française. I'm on a mission to master the Subjunctive mood. Currently rank #402 in Bullet duels. Open-source contributor.
                    </p>
                  </div>
               </div>
            </div>
          </div>

          {/* Interactive Multi-Line Graph */}
          <div className="p-6 lg:p-10 border-b border-[#DEDDDA]">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Interactive Evolution</h2>
                    <h2 className="text-2xl font-black font-sans tracking-tight uppercase italic">Unified Performance</h2>
                </div>
            </div>
            
            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#DEDDDA" vertical={false} />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 10, fontWeight: 'bold', fill: '#9CA3AF'}} 
                            dy={10}
                        />
                        <YAxis 
                            domain={['dataMin - 100', 'dataMax + 100']} 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 10, fontWeight: 'bold', fill: '#9CA3AF'}} 
                        />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px', fontFamily: 'monospace' }}
                            itemStyle={{ fontWeight: 'bold', padding: '2px 0' }}
                        />
                        <Legend iconType="rect" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}/>
                        <Line type="monotone" dataKey="bullet" stroke="#EB3514" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Bullet" />
                        <Line type="monotone" dataKey="blitz" stroke="#333333" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Blitz" />
                        <Line type="monotone" dataKey="rapid" stroke="#9CA3AF" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Rapid" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="p-6 lg:p-10">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Activity Feed</h2>
            <div className="space-y-12">
                {activityLog.map((day, idx) => (
                    <div key={idx}>
                        <h3 className="text-xs font-black text-[#333333] mb-6 flex items-center gap-2">
                           <Calendar size={14} className="text-gray-400"/> {day.date}
                        </h3>
                        <div className="ml-2 border-l-2 border-[#DEDDDA] pl-8 space-y-8">
                            {day.entries.map((entry, i) => (
                                <div key={i} className="relative group flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="absolute -left-[37px] top-1 w-4 h-4 rounded-full bg-[#F0EFEB] border-2 border-[#DEDDDA] group-hover:border-[#EB3514] transition-colors flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-[#EB3514] transition-colors" />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-gray-400">{entry.icon}</span>
                                        <p className="text-sm font-bold text-[#333333]">{entry.text}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="px-2 py-1 bg-[#EAE9E4] rounded text-[11px] font-black flex items-center gap-2">
                                            {entry.rating}
                                            <span className={parseInt(entry.change) > 0 ? 'text-green-500' : 'text-red-500'}>{entry.change}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </main>

        {/* RIGHT SIDEBAR: Pure Player Metrics */}
        <aside className="w-full lg:w-[280px] border-l border-[#DEDDDA] p-6 flex flex-col gap-8 bg-[#F8F7F2]/50">
          <div>
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Player Metrics</h2>
            <div className="space-y-3">
                <StatRow label="Global Rank" value="54,439" />
                <StatRow label="Accuracy" value="88.2%" />
                <StatRow label="Win Rate" value="54.2%" />
                <StatRow label="Avg Speed" value="1.2s / verb" />
                <StatRow label="Streak" value="12 Days" />
            </div>
          </div>

          <div className="p-5 bg-white border border-[#DEDDDA] rounded-2xl shadow-sm">
             <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Trophy size={12} className="text-[#EB3514]"/> Achievements
             </h2>
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-[#EB3514]/10 flex items-center justify-center text-[#EB3514] font-black text-[10px]">100</div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase leading-tight">Mastered 100 Irregular Verbs</div>
                </div>
                <div className="flex items-center gap-3 opacity-40">
                    <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center text-gray-500 font-black text-[10px]">🔥</div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase leading-tight">Maintain a 30-day Streak</div>
                </div>
             </div>
          </div>

          <div className="mt-auto">
             <button className="w-full py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-2">
                <Mail size={12}/> Message User
             </button>
          </div>
        </aside>

      </div>
      
      <footer className="py-4 px-10 border-t border-[#DEDDDA] text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] flex justify-between bg-white/50">
        <span>VERBY_DATA_SHEET // ID_2047</span>
        <div className="flex gap-4">
            <a href="#" className="hover:text-[#EB3514]">Export PGN</a>
            <a href="#" className="hover:text-[#EB3514]">Privacy</a>
        </div>
      </footer>
    </div>
  );
};

const StatRow = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-[#DEDDDA]/50">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{label}</span>
        <span className="text-xs font-black">{value}</span>
    </div>
);

export default Profile;