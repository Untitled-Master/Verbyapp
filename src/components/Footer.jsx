import React from 'react';
import { Github, Twitter, Linkedin, Youtube, Send, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="py-16 px-8 font-mono bg-[#F0EFEB] border-t border-[#F1F0EC] relative overflow-hidden">
      {/* Decorative background watermark */}
      <div className="absolute -bottom-12 -right-12 text-[#EB3514] opacity-[0.03] pointer-events-none select-none">
        <h1 className="text-[12rem] font-black leading-none">VERBY</h1>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">

          {/* Column 1: Platform */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-[#333333] mb-2 uppercase tracking-widest">Platform</span>
            <FooterLink href="#">Blitz Mode</FooterLink>
            <FooterLink href="#">Friend Duels</FooterLink>
            <FooterLink href="#">Daily Puzzles</FooterLink>
            <FooterLink href="#">Leaderboard</FooterLink>
            <FooterLink href="#">Ranked Play</FooterLink>
          </div>

          {/* Column 2: Learning */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-[#333333] mb-2 uppercase tracking-widest">Learning</span>
            <FooterLink href="#">Verb Groups</FooterLink>
            <FooterLink href="#">Mistake Review</FooterLink>
            <FooterLink href="#">Tense Guide</FooterLink>
            <FooterLink href="#">Grammar Tips</FooterLink>
            <FooterLink href="#">AI Feedback</FooterLink>
          </div>

          {/* Column 3: Project */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-[#333333] mb-2 uppercase tracking-widest">Project</span>
            <FooterLink href="#">Open Source</FooterLink>
            <FooterLink href="#">Roadmap</FooterLink>
            <FooterLink href="#">Contribute</FooterLink>
            <FooterLink href="#">Changelog</FooterLink>
            <FooterLink href="#">Documentation</FooterLink>
          </div>

          {/* Column 4: Legal / Contact */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-[#333333] mb-2 uppercase tracking-widest">Company</span>
            <FooterLink href="#">About</FooterLink>
            <FooterLink href="#">Blog</FooterLink>
            <FooterLink href="#">Privacy</FooterLink>
            <FooterLink href="#">Terms</FooterLink>
            <a href="mailto:hello@verby.io" className="text-sm text-gray-400 transition-colors hover:text-[#EB3514] flex items-center gap-2 mt-2">
              <Mail size={14} /> hello@verby.io
            </a>
          </div>

          {/* Column 5: Social */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-[#333333] mb-2 uppercase tracking-widest">Community</span>
            <SocialLink href="#" icon={<Twitter size={14}/>}>Twitter / X</SocialLink>
            <SocialLink href="#" icon={<Linkedin size={14}/>}>LinkedIn</SocialLink>
            <SocialLink href="#" icon={<Youtube size={14}/>}>YouTube</SocialLink>
            <SocialLink href="#" icon={<Send size={14}/>}>Telegram</SocialLink>
            <SocialLink href="#" icon={<Github size={14}/>}>GitHub</SocialLink>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#F1F0EC] flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            <p>© 2026 Verby</p>
            <span className="hidden md:inline text-gray-200">|</span>
            <p>Made with ♡ by Ahmed</p>
          </div>

          <div className="flex gap-6 items-center">
             <div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-help">
                <div className="w-6 h-6 rounded border border-gray-400 flex items-center justify-center text-[8px] font-bold">GDPR</div>
                <div className="w-6 h-6 rounded border border-gray-400 flex items-center justify-center text-[8px] font-bold">OSS</div>
             </div>
             <button className="text-[10px] text-gray-400 uppercase tracking-widest font-bold hover:text-[#333333] transition-colors">
               Cookie Settings
             </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ href, children }) => (
  <a href={href} className="text-sm text-gray-400 transition-colors hover:text-[#333333]">
    {children}
  </a>
);

const SocialLink = ({ href, icon, children }) => (
  <a href={href} className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-[#333333] group">
    <span className="text-gray-400 group-hover:text-[#EB3514] transition-colors">
      {icon}
    </span>
    {children}
  </a>
);

export default Footer;
