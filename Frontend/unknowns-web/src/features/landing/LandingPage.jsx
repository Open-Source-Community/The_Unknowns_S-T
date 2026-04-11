import React, { useEffect, useRef } from 'react';
import { ShieldCheck, Zap, Terminal, Box, GitBranch, ArrowRight, Cpu } from 'lucide-react';

import { Navbar } from '../../components/Navbar';
import { Button } from '../../components/Button';
import { LandingCard } from '../../components/LandingCard';
import lottie from 'lottie-web';
import techAnimation from "../../assets/Server.json";


const LottieAnimation = () => {
  const container = useRef(null);

  useEffect(() => {
    const instance = lottie.loadAnimation({
      container: container.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: techAnimation,
    });
    return () => instance.destroy();
  }, []);

  return <div className="w-full h-full" ref={container} />;
};


const LandingPage = () => {
  return (
<div className="min-h-screen bg-[#020617] text-white selection:bg-purple-500/30 font-sans overflow-hidden">
      
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/15 blur-[120px] rounded-full" />
      <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-fuchsia-900/10 blur-[120px] rounded-full" />

      <div className="max-w-[1400px] mx-auto px-8 md:px-12 relative z-10"> 
        {/* <Navbar /> */}

        {/* Hero Section */}
      
       <div className="flex flex-col md:flex-row items-center pt-24 pb-32 gap-16">

          <div id='home' className="w-full md:w-3/5">  
             <h1 className="text-6xl md:text-[5.5rem] font-black leading-[1] mb-8 tracking-tighter animate-in fade-in slide-in-from-left duration-1000">
              Stop Configuring. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-400 italic">Deploy Artifacts.</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 font-medium leading-relaxed">
              The premium vault for security-hardened infrastructure and Linux rices.
              Acquire optimized blueprints and automation spells in one click.
              <span className="text-slate-200 block mt-2 font-bold italic">Digital Assets for the Elite.</span>
            </p>

         <div className="flex flex-wrap items-center gap-6 border-t border-slate-800/50 pt-10">
              <div className="flex flex-col">        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Powered By</span>
                <span className="text-sm font-black text-slate-300">UNKNOWN$ ENGINE</span>
              </div>
              <Button variant="dark" className="group">
                Discover More <ArrowRight className="ml-2 group-hover:translate-x-1 transition" size={16} />
              </Button>
            </div>
          </div>

          {/* Right Content - The Chromatic Element Area */}
     <div className="w-full md:w-2/5 flex justify-center relative animate-float">
            <div className="relative w-full aspect-square max-w-[500px]">
  
              <div className="absolute inset-0 bg-purple-600/15 blur-[80px] rounded-full animate-pulse" />
              
              <div className="relative z-10 w-full h-full drop-shadow-[0_0_60px_rgba(168,85,247,0.35)]">
                <LottieAnimation />
              </div>
            <div className="absolute bottom-[10%] left-[10%] font-mono text-[10px] text-purple-300 opacity-70 bg-black/50 p-2.5 rounded-lg border border-purple-500/20 backdrop-blur-sm">
                {`> artifacts@unknowns: deploy --env=prod --hardened`}
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
       <div id='features' className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-32">   <LandingCard
            icon={<Terminal size={28} />}
            title="Linux Rices"
            desc="Exotic dotfiles and kernel optimizations to turn your terminal into a masterpiece."
          />
          <LandingCard
            icon={<ShieldCheck size={28} />}
            title="Secured Blueprints"
            desc="Hardened Nginx and Docker artifacts pre-audited for production-grade security."
          />
          <LandingCard
            icon={<Cpu size={28} />}
            title="Auto-Infras"
            desc="Scalable IaaS blueprints that deploy complex backend clusters in seconds."
          />
        </div>
      </div>

      <footer className="py-12 text-center text-slate-500 font-medium">
        <p>© 2026 The Unknowns: Artifacts.✨ — Built by The Unknowns Team.</p>
      </footer>
    </div>
  );
};


const style = document.createElement('style');
style.textContent = `
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
    100% { transform: translateY(0px); }
  }
  .animate-float { animation: float 6s ease-in-out infinite; }
`;
document.head.appendChild(style);

export default LandingPage;