import React, { useState } from 'react';
import API from '../../api/axiosConfig';
import { ENDPOINTS, CATEGORIES } from '../../constants/apiEndpoints';
import { X, Package, DollarSign, Tag, Hash, Sparkles, Loader2, Zap } from 'lucide-react';
import Swal from 'sweetalert2';

const AddProductModal = ({ isOpen, onClose, onProductAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: CATEGORIES?.[1] || 'General'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const finalCategory = formData.category === 'Other' ? formData.customCategory : formData.category;
      await API.post(ENDPOINTS.PRODUCTS, {
        ...formData,
        category: finalCategory,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock)
      });
      
      await Swal.fire({
        title: 'ARTIFACT MINTED!',
        text: 'Your asset is now live in the marketplace.',
        icon: 'success',
        background: '#0f172a',
        color: '#f8fafc',
        confirmButtonColor: '#22d3ee',
        customClass: { popup: 'rounded-[2rem] border border-slate-800' }
      });

      onProductAdded();
      onClose();
    } catch (err) {
      Swal.fire({
        title: 'MINTING FAILED',
        text: err.response?.data?.message || 'Failed to list asset',
        icon: 'error',
        background: '#0f172a',
        color: '#f8fafc'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      
      <div className="bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 relative overflow-hidden border border-slate-800 animate-in zoom-in duration-300">
        
        
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-700" />
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
              <Zap size={20} />
            </div>
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Mint New Asset</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Asset Designation</label>
            <div className="relative group">
              <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
              <input 
                type="text" placeholder="e.g. Neural Link Blueprint" 
                className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/40 text-white placeholder:text-slate-700 transition-all"
                onChange={(e) => setFormData({...formData, name: e.target.value})} required 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Price */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Price (Credits)</label>
              <div className="relative group">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                <input 
                  type="number" placeholder="0.00" 
                  className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-cyan-500/40 text-white placeholder:text-slate-700 font-mono text-sm"
                  onChange={(e) => setFormData({...formData, price: e.target.value})} required 
                />
              </div>
            </div>

            {/* Stock */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Inventory Units</label>
              <div className="relative group">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                <input 
                  type="number" placeholder="100" 
                  className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-cyan-500/40 text-white placeholder:text-slate-700 font-mono text-sm"
                  onChange={(e) => setFormData({...formData, stock: e.target.value})} required 
                />
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Artifact Classification</label>
              <div className="relative group">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                <select 
                  className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-cyan-500/40 text-white appearance-none cursor-pointer transition-all text-sm font-bold uppercase tracking-wider"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                >
                  {CATEGORIES.filter(c => c !== "All").map(cat => (
                    <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom Category Input if 'Other' is selected */}
            {formData.category === 'Other' && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <label className="text-[9px] font-black text-cyan-500/60 uppercase tracking-[0.3em] ml-1">Specify Custom Segment</label>
                <input 
                  type="text" 
                  placeholder="e.g. Neural Link, Bio-Mod..." 
                  className="w-full px-6 py-3 bg-slate-950 border border-cyan-500/20 rounded-xl outline-none focus:border-cyan-500/50 text-white placeholder:text-slate-700 text-xs font-bold uppercase"
                  onChange={(e) => setFormData({...formData, customCategory: e.target.value})}
                  required 
                />
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full relative group overflow-hidden bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-cyan-900/10 hover:shadow-cyan-500/40 transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em]"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Sparkles size={18} />
                <span>Initialize Protocol</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;