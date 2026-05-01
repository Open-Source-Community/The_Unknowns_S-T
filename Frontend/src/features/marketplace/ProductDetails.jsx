import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axiosConfig';
import { ENDPOINTS, ROLES, CATEGORIES } from '../../constants/apiEndpoints';
import {
    Cpu, ShoppingBag, ArrowLeft,
    ShieldCheck, Database, Zap, Activity,
    Edit3, Trash2, X, Save, Box, Info
} from 'lucide-react';
import Swal from 'sweetalert2';

const ProductDetails = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user, verifyUser } = useAuth();

    const [product, setProduct] = useState(location.state?.product);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editData, setEditData] = useState({
        name: product?.name || '',
        price: product?.price || 0,
        category: product?.category || '',
        stock: product?.stock || 0
    });

    useEffect(() => {
        if (product?.name) {
            document.title = `${product.name} :: Architect X`;
        } else {
            document.title = "Artifact Details :: Architect X";
        }
    }, [product?.name]);

    if (!product) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-slate-500">
                <Activity size={48} className="mb-4 opacity-20" />
                <p className="font-black uppercase tracking-widest italic">Data Segment Corrupted</p>
                <button onClick={() => navigate('/marketplace')} className="mt-6 text-cyan-500 hover:underline text-xs font-black uppercase tracking-widest">Return to Grid</button>
            </div>
        );
    }

    const isOwner = user?.id === product.sellerId;
    const isAdmin = user?.role === ROLES.ADMIN;

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: 'ERASE ARTIFACT?',
            text: "This removal is permanent across all network segments.",
            icon: 'warning',
            showCancelButton: true,
            background: '#0f172a',
            color: '#fff',
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'CONFIRM DELETION'
        });

        if (result.isConfirmed) {
            try {
                await API.delete(`${ENDPOINTS.PRODUCTS}/${product.id}`);
                Swal.fire({ title: 'ERASED', text: 'Artifact purged from the vault.', icon: 'success', background: '#0f172a', color: '#fff' });
                navigate('/marketplace');
            } catch (err) {
                Swal.fire({ title: 'FAILED', text: 'Deletion protocol failed.', icon: 'error', background: '#0f172a', color: '#fff' });
            }
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const finalCategory = editData.category === 'Other' ? (editData.customCategory || editData.category) : editData.category;
            const res = await API.patch(`${ENDPOINTS.PRODUCTS}/${product.id}`, {
                name: editData.name,
                price: parseFloat(editData.price),
                category: finalCategory,
                stock: parseInt(editData.stock)
            });
            if (res.data.success) {
                const updatedProduct = {
                    ...product,
                    name: editData.name,
                    price: parseFloat(editData.price),
                    category: finalCategory,
                    stock: parseInt(editData.stock)
                };
                setProduct(updatedProduct);
                setIsEditOpen(false);
                Swal.fire({ title: 'SYNCHRONIZED', text: 'Metadata updated successfully.', icon: 'success', background: '#0f172a', color: '#fff', timer: 1500 });
            }
        } catch (err) {
            Swal.fire({ title: 'ERROR', text: 'Update protocol interrupted.', icon: 'error', background: '#0f172a', color: '#fff' });
        }
    };

    const handleBuy = async () => {
        if (!user) { navigate('/login'); return; }
        if (isOwner) {
            Swal.fire({ title: 'OWNERSHIP CONFLICT', text: 'System denied: Illegal to acquire own assets.', icon: 'info', background: '#0f172a', color: '#fff' });
            return;
        }

        const result = await Swal.fire({
            title: 'CONFIRM ACQUISITION',
            text: `Authorize deployment of ${product.name} for $${product.price}?`,
            icon: 'question',
            showCancelButton: true,
            background: '#020617',
            color: '#fff',
            confirmButtonColor: '#22d3ee',
            cancelButtonColor: '#1e293b',
            confirmButtonText: 'INITIALIZE PURCHASE'
        });

        if (result.isConfirmed) {
            try {
                const res = await API.post(ENDPOINTS.ORDERS,
                    { items: [{ productId: product.id, quantity: 1 }] },
                    { headers: { 'Idempotency-Key': `details-buy-${product.id}-${Date.now()}` } }
                );
                if (res.data.success) {
                    Swal.fire({ title: 'SUCCESS', text: 'Artifact secured in your local archive.', icon: 'success', background: '#020617', color: '#fff' });
                    await verifyUser();
                }
            } catch (err) {
                Swal.fire({ title: 'FAILED', text: err.response?.data?.error || 'Transaction protocol error.', icon: 'error', background: '#020617', color: '#fff' });
            }
        }
    };

    const handleTip = async () => {
        if (!user) { navigate('/login'); return; }
        const { value: amount } = await Swal.fire({
            title: 'SEND DEPLOYMENT TIP',
            input: 'number',
            inputLabel: `Send credits to Architect #NODE-${product.sellerId}`,
            background: '#020617',
            color: '#fff',
            confirmButtonColor: '#8b5cf6',
            customClass: { input: 'bg-slate-950 border-slate-800 text-cyan-400 font-mono text-center rounded-xl' }
        });

        if (amount && parseFloat(amount) > 0) {
            try {
                const res = await API.post(ENDPOINTS.WALLET_TRANSFER, {
                    receiverId: product.sellerId,
                    amount: parseFloat(amount),
                    description: `P2P Tip for ${product.name}`
                }, { headers: { 'Idempotency-Key': `tip-${product.id}-${Date.now()}` } });

                if (res.data.success) {
                    Swal.fire({ title: 'TRANSMISSION COMPLETE', text: 'Credits successfully gifted.', icon: 'success', background: '#020617', color: '#fff' });
                    await verifyUser();
                }
            } catch (err) {
                Swal.fire({ title: 'ERROR', text: err.response?.data?.message || 'Check credit equilibrium.', icon: 'error', background: '#020617', color: '#fff' });
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] p-6 lg:p-12 animate-in fade-in duration-700 font-sans">
            {/* Minimal Header */}
            <div className="max-w-7xl mx-auto mb-16 flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-3 text-slate-600 hover:text-white transition-all text-[8px] font-bold uppercase tracking-[0.5em] group"
                >
                    <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
                    BACK_TO_GRID
                </button>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[6px] font-black text-slate-700 uppercase tracking-widest">System_Access</span>
                        <span className="text-[9px] font-black text-cyan-500 uppercase tracking-widest">AUTH_LAYER_01</span>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">

                    {/* Visual Analysis Section (Left) */}
                    <div className="lg:col-span-5 relative group">
                        <div className="relative aspect-square rounded-[3rem] bg-slate-900/20 border border-slate-800/50 overflow-hidden flex items-center justify-center p-20">
                            {/* Scanning Effects */}
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                            <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 to-transparent pointer-events-none" />
                            <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-slate-700 group-hover:border-cyan-500 transition-colors m-6" />
                            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-slate-700 group-hover:border-cyan-500 transition-colors m-6" />

                            <Cpu size={160} className="text-slate-800 group-hover:text-cyan-400 group-hover:scale-110 transition-all duration-1000 drop-shadow-[0_0_50px_rgba(34,211,238,0.1)]" />

                            {/* Technical Overlays */}
                            <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-slate-950/80 px-4 py-1 rounded-full border border-slate-800">
                                <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Status: OPERATIONAL</span>
                            </div>
                        </div>
                    </div>

                    {/* Meta Registry Section (Right) */}
                    <div className="lg:col-span-7 space-y-12">
                        {/* Title Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="w-8 h-[1px] bg-cyan-500" />
                                <span className="text-[7px] font-black text-cyan-500 uppercase tracking-[0.5em]">ARTIFACT_ID_RX-{product.id}</span>
                            </div>
                            <h1 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-[0.8] mb-2">
                                {product.name}
                            </h1>
                            <div className="flex items-center gap-4 text-slate-500 font-bold text-[9px] uppercase tracking-widest">
                                <span className="flex items-center gap-2">
                                    <Box size={10} className="text-purple-500" />
                                    ARCHITECT: {product.seller?.name || "ANONYMOUS"}
                                </span>
                                <span className="text-slate-800">|</span>
                                <span className="flex items-center gap-2">
                                    <Database size={10} className="text-cyan-500" />
                                    NODE: {product.sellerId}
                                </span>
                            </div>
                        </div>

                        {/* Data Grid */}
                        <div className="grid grid-cols-2 gap-8 border-t border-slate-800/40 pt-10">
                            <MetaItem label="Valuation" value={`$${product.price}`} highlight="text-cyan-400" />
                            <MetaItem label="Classification" value={product.category || "General"} />
                            <MetaItem label="Matrix_Stock" value={product.stock} />
                            <MetaItem label="Security" value="Level_01" />
                        </div>

                        {/* Deployment Protocol (Controls) */}

                        {/* Deployment Protocol (Controls) */}
                        <div className="pt-10 border-t border-slate-800/40">
                            {isOwner ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <button
                                        onClick={() => setIsEditOpen(true)}
                                        className="group relative py-5 bg-slate-900 border border-slate-700 text-white text-[9px] font-black uppercase tracking-[0.3em] rounded-2xl overflow-hidden transition-all hover:border-purple-500"
                                    >
                                        <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <span className="flex items-center justify-center gap-3 relative z-10 group-hover:text-purple-400">
                                            <Edit3 size={14} />
                                            Initialize Edit
                                        </span>
                                    </button>

                                    <button
                                        onClick={handleDelete}
                                        className="group py-5 bg-transparent border border-red-900/50 text-red-500/50 text-[9px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300 flex items-center justify-center gap-3"
                                    >
                                        <Trash2 size={14} className="group-hover:animate-pulse" />
                                        System Purge
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <button
                                            onClick={handleBuy}
                                            className="flex-[2] relative overflow-hidden px-10 py-6 bg-cyan-500 text-black text-[11px] font-black uppercase tracking-[0.4em] rounded-2xl hover:shadow-[0_0_40px_rgba(34,211,238,0.3)] transition-all active:scale-95 group"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] " />
                                            <span className="relative z-10">Acquire Artifact</span>
                                        </button>

                                        <button
                                            onClick={handleTip}
                                            className="flex-1 px-10 py-6 bg-slate-950 border border-slate-800 text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] rounded-2xl hover:text-cyan-400 hover:border-cyan-500/50 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Zap size={12} />
                                            Tip
                                        </button>
                                    </div>
                                    {/* Admin Section */}
                                    {isAdmin && (
                                        <button
                                            onClick={handleDelete}
                                            className="w-full py-4 bg-red-500/5 border border-red-500/10 text-red-900 text-[7px] font-black uppercase tracking-[0.6em] rounded-xl hover:text-red-500 hover:border-red-500 transition-all"
                                        >
                                            ADMIN_OVERRIDE_PURGE
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>



                    </div>
                </div>
            </div>

            {/* Edit Protocol Modal */}
            {isEditOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/95 backdrop-blur-xl p-4 animate-in fade-in duration-300">
                    <div className="bg-slate-900/50 border border-slate-800 w-full max-w-md rounded-[3rem] p-10 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-500" />

                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Edit Protocol</h3>
                                <p className="text-[8px] text-slate-500 font-black tracking-widest uppercase">System_Metadata_Overwrite</p>
                            </div>
                            <button onClick={() => setIsEditOpen(false)} className="text-slate-500 hover:text-white transition-all"><X size={24} /></button>
                        </div>

                        <form onSubmit={handleUpdate} className="space-y-8">
                            <div className="space-y-1">
                                <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest ml-1">Asset_Designation</label>
                                <input value={editData.name} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-white text-sm outline-none focus:border-cyan-500 transition-all" onChange={e => setEditData({ ...editData, name: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest ml-1">Classification</label>
                                    <select
                                        className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-white text-sm outline-none focus:border-cyan-500 appearance-none uppercase font-bold"
                                        value={CATEGORIES.includes(editData.category) ? editData.category : 'Other'}
                                        onChange={e => setEditData({ ...editData, category: e.target.value })}
                                    >
                                        {CATEGORIES.filter(c => c !== "All").map(cat => (
                                            <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest ml-1">Valuation</label>
                                    <input type="number" value={editData.price} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-white text-sm outline-none focus:border-cyan-500 font-mono" onChange={e => setEditData({ ...editData, price: e.target.value })} />
                                </div>
                            </div>

                            {editData.category === 'Other' && (
                                <div className="space-y-1 animate-in slide-in-from-top-2">
                                    <label className="text-[7px] font-black text-cyan-500 uppercase tracking-widest ml-1">Custom_Sector</label>
                                    <input value={editData.customCategory || ''} className="w-full bg-slate-950 border border-cyan-500/20 p-4 rounded-xl text-white text-sm outline-none focus:border-cyan-500" onChange={e => setEditData({ ...editData, customCategory: e.target.value })} />
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest ml-1">Matrix_Stock</label>
                                <input type="number" value={editData.stock} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-white text-sm outline-none focus:border-cyan-500 font-mono" onChange={e => setEditData({ ...editData, stock: e.target.value })} />
                            </div>

                            <button type="submit" className="w-full py-5 bg-white text-black text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-cyan-500 hover:text-white transition-all flex items-center justify-center gap-3">
                                <Save size={16} />
                                Synchronize Meta
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const MetaItem = ({ label, value, highlight }) => (
    <div className="space-y-1">
        <span className="text-[7px] font-black text-slate-600 uppercase tracking-[0.3em] block">{label}</span>
        <div className={`text-xl font-black italic tracking-tighter uppercase ${highlight || 'text-white'}`}>
            {value}
        </div>
    </div>
);

export default ProductDetails;
