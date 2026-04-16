import React, { useEffect, useState } from 'react';
import API from '../../api/axiosConfig';
import { ENDPOINTS } from '../../constants/apiEndpoints';
import {
    TrendingUp, TrendingDown, DollarSign,
    Activity, RefreshCcw, Loader2,
    ArrowUpRight, ArrowDownLeft, BarChart3
} from 'lucide-react';

const SellerOverview = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = "Node Analytics :: Architect X";
    }, []);
    const [stats, setStats] = useState({
        inflow: 0,
        outflow: 0,
        net: 0,
        count: 0,
        distributions: {
            funding: 0,
            acquisitions: 0,
            deployments: 0
        }
    });

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const res = await API.get(ENDPOINTS.WALLET_HISTORY);
            if (res.data.success) {
                const logs = res.data.data || [];
                setHistory(logs);

                // Perform Analysis
                let inflow = 0;
                let outflow = 0;
                let fundingVol = 0;
                let acqVol = 0;
                let depVol = 0;

                logs.forEach(tx => {
                    const amt = parseFloat(tx.amount);
                    if (tx.type === 'Credit') inflow += amt;
                    else outflow += amt;

                    switch (tx.category) {
                        case 'Deposit': fundingVol += amt; break;
                        case 'Purchase': acqVol += amt; break;
                        case 'Transfer': depVol += amt; break;
                        default: depVol += amt;
                    }
                });

                const totalVol = fundingVol + acqVol + depVol || 1;

                setStats({
                    inflow,
                    outflow,
                    net: inflow - outflow,
                    count: logs.length,
                    distributions: {
                        funding: Math.round((fundingVol / totalVol) * 100),
                        acquisitions: Math.round((acqVol / totalVol) * 100),
                        deployments: Math.round((depVol / totalVol) * 100)
                    }
                });
            }
        } catch (err) {
            console.error("Analysis Protocol Failed:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAnalytics(); }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="animate-spin text-purple-500" size={48} />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Running Financial Diagnostics...</p>
        </div>
    );

    return (
        <div className="animate-in fade-in duration-700 space-y-12">

            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] ml-1 italic">Venture_Performance_Ledger</span>
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
                        Business <span className="text-purple-500">Analysis.</span>
                    </h2>
                </div>
                <button
                    onClick={fetchAnalytics}
                    className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 hover:text-white transition-all group"
                >
                    <RefreshCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                </button>
            </div>

            {/* Matrix Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Liquidity Inflow"
                    value={`$${stats.inflow.toLocaleString()}`}
                    icon={<TrendingUp size={20} />}
                    color="text-green-400"
                    desc="Total Credits processed"
                />
                <StatCard
                    label="Operations Overhead"
                    value={`$${stats.outflow.toLocaleString()}`}
                    icon={<TrendingDown size={20} />}
                    color="text-red-400"
                    desc="Total Debits / Spending"
                />
                <StatCard
                    label="Net Performance"
                    value={`$${stats.net.toLocaleString()}`}
                    icon={<DollarSign size={20} />}
                    color={stats.net >= 0 ? "text-cyan-400" : "text-blue-400"}
                    desc="P/L Balance delta"
                />
                <StatCard
                    label="Ledger Density"
                    value={stats.count}
                    icon={<Activity size={20} />}
                    color="text-slate-400"
                    desc="Total transaction nodes"
                />
            </div>

            {/* Analysis Visual Representation */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">

                {/* Visual Chart Placeholder Area */}
                <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-10 backdrop-blur-md relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 blur-[80px] rounded-full -z-10" />

                    <h4 className="text-[11px] font-black text-white uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                        <BarChart3 size={18} className="text-purple-500" /> Revenue_Architecture_Visualizer
                    </h4>

                    {/* Simple CSS-based bar visualization */}
                    <div className="space-y-8">
                        <AnalysisBar label="Funding Protocols" percentage={stats.distributions.funding} color="bg-cyan-500" />
                        <AnalysisBar label="Asset Acquisitions" percentage={stats.distributions.acquisitions} color="bg-purple-500" />
                        <AnalysisBar label="Network Deployments" percentage={stats.distributions.deployments} color="bg-blue-600" />
                    </div>
                </div>

                {/* Recent Logs */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 flex flex-col">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Recent_Activity</h4>
                    <div className="space-y-4 flex-1">
                        {history.slice(0, 5).map((tx, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3.5 bg-slate-950/40 border border-slate-800/50 rounded-2xl hover:border-slate-700 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${tx.type === 'Credit' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {tx.type === 'Credit' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-300 uppercase truncate max-w-[100px]">{tx.category}</span>
                                </div>
                                <span className={`text-[11px] font-black font-mono ${tx.type === 'Credit' ? 'text-green-400' : 'text-red-400'}`}>
                                    {tx.type === 'Credit' ? '+' : '-'}${parseFloat(tx.amount).toFixed(0)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

        </div>
    );
};

const StatCard = ({ label, value, icon, color, desc }) => (
    <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem] hover:border-slate-700 transition-all group relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            {icon}
        </div>
        <div className="relative z-10">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-4">{label}</span>
            <div className={`text-3xl font-black italic tracking-tighter mb-2 ${color}`}>
                {value}
            </div>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">{desc}</p>
        </div>
    </div>
);

const AnalysisBar = ({ label, percentage, color }) => (
    <div className="space-y-3">
        <div className="flex justify-between items-end">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
            <span className="text-[10px] font-mono text-white">{percentage}%</span>
        </div>
        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
            <div
                className={`h-full ${color} shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all duration-1000 ease-out`}
                style={{ width: `${percentage}%` }}
            />
        </div>
    </div>
);

export default SellerOverview;
