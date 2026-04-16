import React from 'react';
import { Cpu, Sparkles, User, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ArtifactCard = ({ product, actionButton }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/marketplace/${product.id}`, { state: { product } });
  };
  return (
    <div 
      onClick={handleNavigate}
      className="group relative bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-slate-800 p-6 hover:border-cyan-500/50 transition-all duration-500 flex flex-col overflow-hidden h-full cursor-pointer"
    >
      
      {/* Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-[2.5rem] blur opacity-0 group-hover:opacity-10 transition duration-500" />

      {/* Artifact Icon Box */}
      <div className="relative h-48 bg-slate-950/50 rounded-3xl mb-6 flex items-center justify-center border border-slate-800 group-hover:border-cyan-500/30 transition-all group/icon">
        <div className="absolute top-4 right-4 text-slate-800 group-hover:text-cyan-500/20 transition-colors">
          <ShieldCheck size={18} />
        </div>
        <Cpu size={64} className="text-slate-800 group-hover:text-cyan-500 transition-all duration-500 group-hover:scale-110" />
      </div>

      {/* Product Info */}
      <div className="relative flex-1">
        <h3 className="font-black text-white text-xl tracking-tight leading-tight group-hover:text-cyan-400 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-800">
            {product.category || "General"}
          </span>
        </div>
        
        <div className="flex flex-col gap-1.5 mt-4">
          <div className="flex items-center text-slate-500">
            <User size={12} className="mr-2 text-purple-500" />
            <span className="text-[9px] font-black uppercase tracking-widest leading-none">
              Architect: {product.seller?.name || "Standard Architect"}
            </span>
          </div>
          <div className="flex items-center text-slate-700">
            <ShieldCheck size={10} className="mr-2 text-slate-700" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em] leading-none italic">
              Signature: #NODE-{product.sellerId}
            </span>
          </div>
        </div>
      </div>

      {/* Price & Action Button */}
      <div className="relative mt-8 flex items-center justify-between border-t border-slate-800/50 pt-5">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Price</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-white">${product.price}</span>
            <span className="text-[10px] font-bold text-cyan-500 uppercase font-mono">Credits</span>
          </div>
        </div>
        
        
        <div onClick={(e) => e.stopPropagation()}>
          {actionButton}
        </div>
      </div>
    </div>
  );
};

export default ArtifactCard;