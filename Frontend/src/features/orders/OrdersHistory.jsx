import React, { useEffect, useState } from 'react';
import API from '../../api/axiosConfig';
import { ENDPOINTS } from '../../constants/apiEndpoints';
import {
    Box, Calendar, CreditCard,
    XCircle, RefreshCcw, Loader2, PackageOpen,
    ArrowUpRight, AlertCircle
} from 'lucide-react';
import Swal from 'sweetalert2';

const OrdersHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = "Acquisition Log :: Architect X";
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await API.get(ENDPOINTS.ORDERS);
            setOrders(res.data.data || []);
        } catch (err) {
            console.error("Ledger Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    const handleCancelOrder = async (orderId) => {
        const result = await Swal.fire({
            title: 'ABORT PROTOCOL?',
            text: "Funds will be re-initialized in your vault.",
            icon: 'warning',
            showCancelButton: true,
            background: '#020617',
            color: '#fff',
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'CANCEL ORDER'
        });

        if (result.isConfirmed) {
            try {
                const res = await API.patch(`${ENDPOINTS.ORDERS}/${orderId}/cancel`, {}, {
                    headers: { 'Idempotency-Key': `cancel-${orderId}-${Date.now()}` }
                });
                if (res.data.success) {
                    Swal.fire({ title: 'REFUNDED', icon: 'success', background: '#020617', color: '#fff' });
                    fetchOrders();
                }
            } catch (err) {
                Swal.fire({ title: 'ERROR', text: 'Termination failed.', icon: 'error', background: '#020617' });
            }
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="animate-spin text-purple-500" size={48} />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Scanning Grid Inventory...</p>
        </div>
    );

    return (
        <div className="animate-in fade-in duration-700">

            {/* Header */}
            <div className="flex justify-between items-end mb-12">
                <div>
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] ml-1 italic">Node_Acquisition_Ledger</span>
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
                        Deployment <span className="text-purple-500">Archive.</span>
                    </h2>
                </div>
                <button onClick={fetchOrders} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 hover:text-white transition-all">
                    <RefreshCcw size={16} />
                </button>
            </div>

            <div className="space-y-6">
                {orders.length > 0 ? orders.map((order) => (
                    <div key={order.id} className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 backdrop-blur-md relative overflow-hidden group hover:border-slate-700 transition-all">

                        {/* Status Background Glow */}
                        <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-10 -z-10 ${order.status === 'Paid' ? 'bg-green-500' :
                                order.status === 'Cancelled' ? 'bg-red-500' :
                                    'bg-blue-500'
                            }`} />

                        <div className="flex flex-col lg:flex-row gap-10">

                            {/* Column 1: Metadata */}
                            <div className="lg:w-1/4 space-y-6">
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Log_Reference</h4>
                                    <div className="text-white font-black italic">#ORD-{order.id}</div>
                                </div>

                                <div className="flex gap-4 items-center">
                                    <div className={`p-2 rounded-lg ${order.status === 'Paid' ? 'bg-green-500/10 text-green-400' :
                                            order.status === 'Cancelled' ? 'bg-red-500/10 text-red-500' :
                                                'bg-blue-500/10 text-blue-400'
                                        }`}>
                                        <CreditCard size={18} />
                                    </div>
                                    <div>
                                        <span className="block text-[8px] font-black text-slate-600 uppercase tracking-widest">Status</span>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${order.status === 'Paid' ? 'text-green-500' :
                                                order.status === 'Cancelled' ? 'text-red-500' :
                                                    'text-blue-500'
                                            }`}>{order.status}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-800/50">
                                    <span className="block text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Time_Stamp</span>
                                    <p className="text-[10px] font-bold text-slate-400 font-mono">
                                        {new Date(order.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Column 2: Artifact Details (Items) */}
                            <div className="flex-1 space-y-3">
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4 block">Secured_Artifacts</span>
                                {order.items?.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-slate-950/40 p-4 rounded-2xl border border-slate-800 group-hover:border-slate-700 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-800 text-purple-500">
                                                <PackageOpen size={16} />
                                            </div>
                                            <div>
                                                <span className="text-xs font-black text-white tracking-tight uppercase italic">{item.product?.name || 'Standard Artifact'}</span>
                                                <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Quantity: 0{item.quantity}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-black text-cyan-400 font-mono">${parseFloat(item.priceAtPurchase).toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Column 3: Totals & Actions */}
                            <div className="lg:w-1/4 flex flex-col justify-between items-end gap-6 border-l border-slate-800/50 pl-6 lg:pl-10">
                                <div className="text-right">
                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-1 italic">Total_Acquisition_Value</span>
                                    <div className="text-3xl font-black text-white tracking-tighter font-mono">
                                        ${parseFloat(order.totalAmount).toLocaleString()}
                                    </div>
                                </div>

                                {order.status === 'Paid' && (
                                    <button
                                        onClick={() => handleCancelOrder(order.id)}
                                        className="flex items-center gap-3 px-6 py-3.5 bg-red-500/5 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all group-hover:shadow-[0_0_30px_rgba(239,68,68,0.1)] active:scale-95"
                                    >
                                        <XCircle size={16} />
                                        Terminate Node
                                    </button>
                                )}
                            </div>

                        </div>
                    </div>
                )) : (
                    <div className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-slate-800 rounded-[3rem] opacity-50">
                        <AlertCircle size={48} className="text-slate-800 mb-4" />
                        <p className="text-slate-600 font-bold uppercase tracking-widest text-[10px]">No acquisition protocols found in local vault.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersHistory;