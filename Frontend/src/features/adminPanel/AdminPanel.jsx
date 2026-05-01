import React, { useState, useEffect, useMemo } from 'react';
import API from '../../api/axiosConfig';
import { ENDPOINTS } from '../../constants/apiEndpoints';
import {
    Users, Wallet, ShieldAlert, Activity, RefreshCcw,
    Search, Loader2, Database, TrendingUp, UserCheck,
    Box, Briefcase, Zap, XCircle, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [wallets, setWallets] = useState([]);
    const [products, setProducts] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingWallets, setLoadingWallets] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [activeSection, setActiveSection] = useState('users');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        document.title = "System Control :: Architect X";
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const [manualOrderId, setManualOrderId] = useState('');
    const { user: currentUser } = useAuth();

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const response = await API.get(ENDPOINTS.USERS);
            setUsers(response.data.data || []);
        } catch (err) {
            console.error("Failed to fetch users matrix:", err);
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchWallets = async () => {
        setLoadingWallets(true);
        try {
            const response = await API.get(ENDPOINTS.ADMIN_WALLETS);
            setWallets(response.data.data || []);
        } catch (err) {
            console.error("Failed to fetch global ledger:", err);
        } finally {
            setLoadingWallets(false);
        }
    };

    const fetchProducts = async () => {
        setLoadingProducts(true);
        try {
            // Fetching a larger batch for stats, though accurate global count isn't possible without a total count endpoint
            const response = await API.get(`${ENDPOINTS.PRODUCTS}?take=100`);
            setProducts(response.data.data || []);
        } catch (err) {
            console.error("Failed to fetch products:", err);
        } finally {
            setLoadingProducts(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchWallets();
        fetchProducts();
    }, []);

    const handleRefresh = () => {
        if (activeSection === 'users') fetchUsers();
        else fetchWallets();
        fetchProducts();
    };

    // Calculate Global Statistics
    const stats = useMemo(() => {
        const totalUsers = users.length;
        const totalLiquidity = users.reduce((acc, user) => acc + parseFloat(user.wallet?.realBalance || 0), 0);
        const roles = users.reduce((acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
        }, { Admin: 0, Seller: 0, Buyer: 0 });

        const totalProducts = products.length;
        const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);

        return {
            totalUsers,
            totalLiquidity,
            roles,
            totalProducts,
            totalStock
        };
    }, [users, products]);

    // Filtered Data
    const filteredUsers = useMemo(() => {
        if (!searchQuery) return users;
        const query = searchQuery.toLowerCase();
        return users.filter(user =>
            user.name?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query) ||
            user.id.toString().includes(query)
        );
    }, [users, searchQuery]);

    const filteredWallets = useMemo(() => {
        if (!searchQuery) return wallets;
        const query = searchQuery.toLowerCase();
        return wallets.filter(wallet =>
            wallet.user?.email?.toLowerCase().includes(query) ||
            wallet.userId.toString().includes(query)
        );
    }, [wallets, searchQuery]);

    const handleManualCancel = async () => {
        // Strict Role Verification before any operation
        if (currentUser?.role !== 'Admin') {
            Swal.fire({
                title: 'ACCESS DENIED',
                text: 'Unauthorized role detected. Command terminated.',
                icon: 'error',
                background: '#0f172a',
                color: '#fff'
            });
            return;
        }

        if (!manualOrderId) return;

        const result = await Swal.fire({
            title: 'INITIALIZE PURGE?',
            text: `Are you sure you want to terminate Order #ORD-${manualOrderId}? This will trigger an automatic refund.`,
            icon: 'warning',
            showCancelButton: true,
            background: '#0f172a',
            color: '#fff',
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'EXECUTE PURGE',
            customClass: { popup: 'rounded-[1.5rem] border border-slate-800' }
        });

        if (result.isConfirmed) {
            try {
                const res = await API.patch(`${ENDPOINTS.ORDERS}/${manualOrderId}/cancel`, {}, {
                    headers: { 'Idempotency-Key': `admin-purge-${manualOrderId}-${Date.now()}` }
                });
                if (res.data.success) {
                    Swal.fire({
                        title: 'PROTOCOL SUCCESS',
                        text: `Order #${manualOrderId} has been purged. Credits returned to buyer.`,
                        icon: 'success',
                        background: '#0f172a',
                        color: '#fff'
                    });
                    setManualOrderId('');
                    fetchWallets(); // Success might change global liquidity
                }
            } catch (err) {
                Swal.fire({
                    title: 'PROTOCOL ERROR',
                    text: err.response?.data?.error || 'Target deployment not found or already processed.',
                    icon: 'error',
                    background: '#0f172a',
                    color: '#fff'
                });
            }
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 w-full max-w-7xl mx-auto px-4">

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-8 relative z-10">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-2 ml-1 flex items-center gap-2">
                        <ShieldAlert size={14} className="text-red-500 animate-pulse" />
                        System_Administration_Interface
                    </span>
                    <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-none italic">
                        Command <span className="text-red-500">Center.</span>
                    </h2>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-md">
                        <button
                            onClick={() => setActiveSection('users')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest ${activeSection === 'users'
                                    ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                                    : 'text-slate-500 hover:text-white hover:bg-slate-800'
                                }`}
                        >
                            <Users size={14} /> Matrix_Nodes
                        </button>
                        <button
                            onClick={() => setActiveSection('wallets')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest ${activeSection === 'wallets'
                                    ? 'bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                                    : 'text-slate-500 hover:text-white hover:bg-slate-800'
                                }`}
                        >
                            <Wallet size={14} /> Global_Ledger
                        </button>
                        <button
                            onClick={() => setActiveSection('intervention')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest ${activeSection === 'intervention'
                                    ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)]'
                                    : 'text-slate-500 hover:text-white hover:bg-slate-800'
                                }`}
                        >
                            <ShieldAlert size={14} /> System_Intervention
                        </button>
                    </div>
                </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard
                    icon={<Database className="text-red-500" />}
                    label="Total Entities"
                    value={stats.totalUsers}
                    subLabel={`${stats.roles.Seller} Sellers | ${stats.roles.Buyer} Buyers`}
                    color="red"
                    progress={(stats.totalUsers / 100) * 100} // Capped at 100 for visual
                />
                <StatCard
                    icon={<TrendingUp className="text-cyan-500" />}
                    label="Platform Liquidity"
                    value={`$${stats.totalLiquidity.toLocaleString()}`}
                    subLabel="Aggregated Real Balance"
                    color="cyan"
                    progress={Math.min((stats.totalLiquidity / 1000000) * 100, 100)} // Visual Progress against 1M$ target
                />
                <StatCard
                    icon={<Box className="text-purple-500" />}
                    label="Marketplace Active"
                    value={stats.totalProducts}
                    subLabel={`${stats.totalStock} Units in Stock`}
                    color="purple"
                    progress={Math.min((stats.totalProducts / 100) * 100, 100)}
                />
                <StatCard
                    icon={<UserCheck className="text-emerald-500" />}
                    label="Admin Clearance"
                    value={stats.roles.Admin}
                    subLabel="Privileged Access Nodes"
                    color="emerald"
                    progress={(stats.roles.Admin / (stats.totalUsers || 1)) * 100}
                />
            </div>

            {/* Content Display */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] backdrop-blur-2xl overflow-hidden min-h-[500px] shadow-2xl relative">

                {/* Control Bar */}
                <div className="p-8 border-b border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-950/40">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                            <Activity size={20} className={activeSection === 'users' ? 'text-red-500' : 'text-cyan-500'} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">
                                {activeSection === 'users' ? 'Detected_Entities' : 'Financial_Flow'}
                            </h3>
                            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">
                                {activeSection === 'users' ? `${filteredUsers.length} Nodes Online` : `${filteredWallets.length} Active Vaults`}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-1 max-w-md w-full gap-4 justify-end">
                        {activeSection !== 'intervention' && (
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                                <input
                                    type="text"
                                    placeholder={`Filter ${activeSection === 'users' ? 'Nodes' : 'Vaults'}...`}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-xs font-mono text-white placeholder:text-slate-700 focus:outline-none focus:border-red-500/50 transition-all font-mono"
                                />
                            </div>
                        )}
                        <button
                            onClick={handleRefresh}
                            className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 hover:text-white transition-all hover:bg-slate-800 shrink-0"
                        >
                            <RefreshCcw size={18} className={(loadingUsers || loadingWallets) ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                {/* Users Table */}
                {activeSection === 'users' && (
                    <div className="overflow-x-auto">
                        {loadingUsers ? (
                            <LoadingState color="red" label="Scanning Neural Grid..." />
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-950/80">
                                    <tr>
                                        <th className="p-6 border-b border-slate-800/50">Node_ID</th>
                                        <th className="p-6 border-b border-slate-800/50">Identity</th>
                                        <th className="p-6 border-b border-slate-800/50">Comlink (Email)</th>
                                        <th className="p-6 border-b border-slate-800/50 text-right">Clearance</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[12px] font-medium text-slate-300 divide-y divide-slate-800/30">
                                    {filteredUsers.map(user => (
                                        <tr key={user.id} className="hover:bg-slate-800/20 transition-all group">
                                            <td className="p-6 font-mono text-[10px] text-slate-500">#{user.id.toString().padStart(4, '0')}</td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${user.role === 'Admin' ? 'bg-red-500 animate-pulse' : 'bg-slate-700'}`} />
                                                    <span className="font-bold tracking-tight text-white group-hover:text-red-400 transition-colors">{user.name || 'Anonymous_Node'}</span>
                                                </div>
                                            </td>
                                            <td className="p-6 text-slate-400 font-mono text-[11px]">{user.email}</td>
                                            <td className="p-6 text-right">
                                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${user.role === 'Admin' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                        user.role === 'Seller' ? 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' :
                                                            user.role === 'Buyer' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                                'bg-slate-800/50 text-slate-500 border-slate-700'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <EmptyState label="No nodes match your filter criteria." />
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* Wallets Table */}
                {activeSection === 'wallets' && (
                    <div className="overflow-x-auto">
                        {loadingWallets ? (
                            <LoadingState color="cyan" label="Decrypting Financial Ledgers..." />
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-950/80">
                                    <tr>
                                        <th className="p-6 border-b border-slate-800/50">Vault_ID</th>
                                        <th className="p-6 border-b border-slate-800/50">Owner_Identity</th>
                                        <th className="p-6 border-b border-slate-800/50 text-right">Available_Credits</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[12px] font-medium text-slate-300 divide-y divide-slate-800/30">
                                    {filteredWallets.map(wallet => (
                                        <tr key={wallet.userId} className="hover:bg-slate-800/20 transition-all group">
                                            <td className="p-6 font-mono text-[10px] text-slate-500">VLT-{wallet.userId.toString().padStart(6, '0')}</td>
                                            <td className="p-6">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-white group-hover:text-cyan-400 transition-colors">{wallet.user?.email}</span>
                                                    <span className="text-[10px] text-slate-600 font-mono uppercase tracking-tighter">Node ID: {wallet.userId}</span>
                                                </div>
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="flex justify-end items-center gap-2">
                                                    <span className="text-[10px] text-slate-600 font-black">$</span>
                                                    <span className="text-2xl font-black text-cyan-400 font-mono tracking-tighter">
                                                        {parseFloat(wallet.realBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredWallets.length === 0 && (
                                        <EmptyState label="No vaults match your filter criteria." />
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* System Intervention Section */}
                {activeSection === 'intervention' && (
                    <div className="p-12 flex flex-col items-center">
                        <div className="max-w-xl w-full">
                            <div className="bg-slate-950/50 border border-slate-800/50 rounded-[2rem] p-10 backdrop-blur-3xl relative overflow-hidden group">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500 blur-[80px] opacity-10 group-hover:opacity-20 transition-all" />

                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20 text-purple-500">
                                        <AlertTriangle size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-black uppercase tracking-[0.2em] text-sm">Force_Order_Termination</h4>
                                        <p className="text-[10px] text-slate-500 font-mono tracking-tighter uppercase">Manual Intervention Protocol 40.2</p>
                                    </div>
                                </div>

                                <div className="space-y-6 relative z-10">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-2">Internal_Reference_ID</label>
                                        <div className="relative">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-mono text-purple-500 text-xs font-black">#ORD-</span>
                                            <input
                                                type="number"
                                                placeholder="0000"
                                                value={manualOrderId}
                                                onChange={(e) => setManualOrderId(e.target.value)}
                                                className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-5 pl-20 pr-6 text-xl font-black text-white focus:outline-none focus:border-purple-500/50 transition-all font-mono placeholder:text-slate-800"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleManualCancel}
                                        disabled={!manualOrderId}
                                        className="w-full py-5 bg-gradient-to-r from-red-600 to-purple-600 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-purple-500/20 hover:shadow-red-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-30 disabled:grayscale disabled:pointer-events-none active:scale-95"
                                    >
                                        Execute Purge Protocol
                                    </button>

                                    <div className="pt-6 border-t border-slate-900 flex items-start gap-3 mt-4">
                                        <XCircle size={14} className="text-slate-600 mt-0.5" />
                                        <p className="text-[9px] text-slate-600 font-medium leading-relaxed uppercase tracking-tighter">
                                            Warning: This action will trigger an irreversible reversal of credits and update the deployment ledger. Admin role is verified for each request.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Sub-components for cleaner structure
const StatCard = ({ icon, label, value, subLabel, color, progress = 60 }) => {
    const colors = {
        red: 'from-red-500/10 to-transparent border-red-500/20 text-red-500',
        cyan: 'from-cyan-500/10 to-transparent border-cyan-500/20 text-cyan-500',
        purple: 'from-purple-500/10 to-transparent border-purple-500/20 text-purple-500',
        emerald: 'from-emerald-500/10 to-transparent border-emerald-500/20 text-emerald-500'
    };

    return (
        <div className={`bg-gradient-to-br ${colors[color]} bg-slate-900/40 p-6 rounded-[2rem] border border-slate-800 backdrop-blur-xl relative overflow-hidden group hover:border-slate-600 transition-all duration-300`}>
            <div className="absolute top-0 right-0 p-8 opacity-5 -mr-4 -mt-4 transform group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div className="flex flex-col gap-1 relative z-10">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</span>
                <span className="text-3xl font-black text-white tracking-tighter drop-shadow-lg">{value}</span>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter mt-1">{subLabel}</span>
            </div>
            {/* Visual Progress/Capacity bar for aesthetic */}
            <div className="mt-4 h-[2px] w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                    className={`h-full bg-current rounded-full transition-all duration-1000 opacity-50`}
                    style={{ width: `${Math.max(5, Math.min(100, progress))}%` }}
                />
            </div>
        </div>
    );
};

const LoadingState = ({ color, label }) => (
    <div className="flex flex-col items-center justify-center py-32 gap-6">
        <div className="relative">
            <Loader2 className={`animate-spin ${color === 'red' ? 'text-red-500' : 'text-cyan-500'}`} size={48} />
            <Zap className="absolute inset-0 m-auto text-slate-900" size={12} />
        </div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] animate-pulse">{label}</p>
    </div>
);

const EmptyState = ({ label }) => (
    <tr>
        <td colSpan="4" className="text-center py-20">
            <div className="flex flex-col items-center gap-4 opacity-40">
                <Search size={40} className="text-slate-500" />
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</p>
            </div>
        </td>
    </tr>
);

export default AdminPanel;

