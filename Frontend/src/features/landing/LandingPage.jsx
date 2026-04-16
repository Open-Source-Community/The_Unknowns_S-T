import React, { useEffect, useRef } from 'react';
import {
  ShieldCheck, Zap, Terminal, Box,
  GitBranch, ArrowRight, Cpu, Layers
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { Button } from '../../components/Button';
import { LandingCard } from '../../components/LandingCard';
import lottie from 'lottie-web';
import techAnimation from "../../assets/Server.json";
import { useNavigate } from 'react-router-dom';


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
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Architect X :: Digital Foundry";
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-cyan-500/30 font-sans overflow-hidden">

      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-purple-900/10 blur-[120px] rounded-full" />

      <div className="max-w-[1400px] mx-auto px-8 md:px-12 relative z-10">
        {/* <Navbar /> */}

        {/* Hero Section */}

        <div className="flex flex-col md:flex-row items-center pt-24 pb-32 gap-16">

          <div id='home' className="w-full md:w-3/5">
            <h1 className="text-6xl md:text-[5.5rem] font-black leading-[1] mb-8 tracking-tighter animate-in fade-in slide-in-from-left duration-1000">
              Stop Configuring. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 italic">Scale Infrastructure.</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 font-medium leading-relaxed">
              The premier repository for security-hardened infrastructure and high-performance environments.
              Deploy production-ready blueprints and automated orchestration protocols instantly.
              <span className="text-cyan-400 block mt-2 font-bold italic tracking-wide">Foundational Engineering for the Modern Era.</span>
            </p>

            <div className="flex flex-wrap items-center gap-6 border-t border-slate-800/50 pt-10">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mb-1">Architecture By</span>
                <span className="text-sm font-black text-slate-300">ARCHITECT X CORE</span>
              </div>
              <Button
                variant="dark"
                className="group border-cyan-500/20 hover:border-cyan-500/50"
                onClick={() => navigate('/register')}
              >
                Initialize Deployment <ArrowRight className="ml-2 group-hover:translate-x-1 transition" size={16} />
              </Button>
            </div>
          </div>

          {/* Right Content - The Chromatic Element Area */}
          <div className="w-full md:w-2/5 flex justify-center relative animate-float">
            <div className="relative w-full aspect-square max-w-[500px]">

              <div className="absolute inset-0 bg-cyan-600/10 blur-[80px] rounded-full animate-pulse" />

              <div className="relative z-10 w-full h-full drop-shadow-[0_0_60px_rgba(34,211,238,0.2)]">
                <LottieAnimation />
              </div>
              <div className="absolute bottom-[10%] left-[10%] font-mono text-[10px] text-cyan-300 opacity-70 bg-black/50 p-2.5 rounded-lg border border-cyan-500/20 backdrop-blur-sm">
                {`> architect-x@system: provisioning --env=prod --hardened`}
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div id='features' className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-32 pt-16 scroll-mt-20">
          <LandingCard
            icon={<Terminal size={28} className="text-cyan-400" />}
            title="System Blueprints"
            desc="Optimized environment configurations and hardened kernel parameters for peak system performance."
          />
          <LandingCard
            icon={<ShieldCheck size={28} className="text-purple-500" />}
            title="Secure Infrastructure"
            desc="Pre-audited, security-hardened service configurations (Nginx, Docker, Auth) for production environments."
          />
          <LandingCard
            icon={<Layers size={28} className="text-cyan-500" />}
            title="Cloud Orchestration"
            desc="Advanced IaC templates for deploying scalable multi-node architectures in seconds."
          />
        </div>

        {/* Who Are We Section */}
        <div id="about" className="py-32 border-t border-slate-800/50 relative scroll-mt-10">
          <h2 className="text-4xl md:text-5xl font-black mb-12 tracking-tighter uppercase italic">
            Who are <span className="text-cyan-400">We?</span>
          </h2>
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="w-full md:w-1/2 text-slate-400 text-lg leading-relaxed space-y-6">
              <p>
                We are <strong className="text-white">ARCHITECT X</strong>, a collective specializing in hardened infrastructure, site reliability, and digital architecture. Built on a foundation of operational excellence, we have distilled years of enterprise-grade engineering into flawlessly structured <span className="text-cyan-400 font-bold italic underline decoration-cyan-900">Foundational Artifacts.</span>
              </p>
              <p>
                Our mission is to empower teams with high-performance system environments, production-ready backend layouts, and automation tools that eliminate the trade-off between deployment speed and system security.
              </p>
            </div>
            <div className="w-full md:w-1/2 grid grid-cols-2 gap-6 relative">
              <div className="absolute inset-0 bg-cyan-900/10 blur-[80px] rounded-full -z-10" />
              <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem] flex flex-col justify-center transform hover:-translate-y-1 transition-transform">
                <h4 className="text-4xl font-black text-white italic">24/7</h4>
                <span className="text-[10px] text-cyan-500 uppercase tracking-[0.2em] font-bold mt-2">Node Uptime</span>
              </div>
              <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem] flex flex-col justify-center transform hover:-translate-y-1 transition-transform">
                <h4 className="text-4xl font-black text-white italic">&lt;1ms</h4>
                <span className="text-[10px] text-purple-500 uppercase tracking-[0.2em] font-bold mt-2">Deploy Latency</span>
              </div>
              <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem] flex flex-col justify-center col-span-2 transform hover:-translate-y-1 transition-transform">
                <h4 className="text-2xl font-black text-white italic">Zero-Day</h4>
                <span className="text-[10px] text-cyan-400 uppercase tracking-[0.2em] font-bold mt-2">Vulnerability Tolerance</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="py-12 text-center text-slate-600 font-medium border-t border-slate-900/50 mt-20">
        <p>© 2026 ARCHITECT X : Digital Foundaries — Pioneering Digital Infrastructure.</p>
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