import React, { useState, useEffect } from 'react';
import API from '../../api/axiosConfig';
import { ENDPOINTS } from '../../constants/apiEndpoints';
import { Package, Calendar, CheckCircle, Loader2, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await API.get(ENDPOINTS.ORDERS);
        setOrders(response.data.data || []);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-8 font-sans">
      
      {/* Header */}
      <div className="mb-12 relative">
        <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full" />
        <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">
          Acquisition <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">History</span>
        </h2>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-1">Verified Protocol Logs</p>
      </div>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="animate-spin text-cyan-500" size={48} />
          <p className="text-slate-500 font-black tracking-widest uppercase">Syncing Transaction Logs...</p>
        </div>
      ) : (
        <div className="grid gap-6 max-w-5xl">
          {orders.map((order) => (
            <div 
              key={order.id} 
              className="group relative bg-slate-900/40 backdrop-blur-xl p-6 rounded-[2.5rem] border border-slate-800 flex flex-col md:flex-row items-center justify-between hover:border-cyan-500/30 transition-all duration-500 overflow-hidden"
            >
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />

              <div className="flex items-center space-x-6 relative z-10 w-full md:w-auto">
                <div className="p-5 bg-slate-950 border border-slate-800 text-cyan-400 rounded-3xl group-hover:scale-110 transition-transform duration-500">
                  <ShieldCheck size={28} />
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded-md uppercase tracking-widest">Verified</span>
                    <span className="text-[10px] font-bold text-slate-500 font-mono">ID: {order.id.slice(-8)}</span>
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-cyan-400 transition-colors">
                    {order.product?.name || "Digital Artifact"}
                  </h3>
                  <div className="flex items-center text-slate-500 text-[11px] mt-2 font-bold uppercase tracking-wider gap-4">
                    <span className="flex items-center gap-1">
                      <Clock size={14} className="text-slate-600" />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 text-slate-600">
                      <Package size={14} />
                      QTY: 01
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto mt-6 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-slate-800/50 relative z-10">
                <div className="flex flex-col md:items-end">
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Total Investment</span>
                  <p className="text-3xl font-black text-white font-mono leading-none mt-1">${order.totalPrice}</p>
                </div>
                
                <button className="flex items-center text-[10px] font-black text-cyan-400 hover:text-white bg-cyan-400/5 hover:bg-cyan-500 px-4 py-2 rounded-xl uppercase mt-4 transition-all group/btn">
                  View Source <ArrowRight size={12} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
          
          {orders.length === 0 && (
            <div className="text-center py-32 bg-slate-900/20 rounded-[3rem] border-2 border-dashed border-slate-800">
               <Package size={48} className="mx-auto text-slate-800 mb-4" />
               <p className="text-slate-600 font-black uppercase tracking-widest italic">No transactions recorded in this vault.</p>
               <button className="mt-6 text-cyan-400 font-bold hover:underline">Access Marketplace</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyOrders;