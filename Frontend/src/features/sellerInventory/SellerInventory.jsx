import React, { useState, useEffect } from 'react';
import ArtifactCard from '../../components/ArtifactCard';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axiosConfig';
import { ENDPOINTS } from '../../constants/apiEndpoints';
import { Edit3, Trash2, Plus, Loader2, Package, X, Save } from 'lucide-react';

const SellerInventory = ({ setIsModalOpen }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    document.title = "Blueprint Vault :: Architect X";
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await API.get(ENDPOINTS.SELLER_PRODUCTS);
      setProducts(response.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInventory(); }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'ERASE ARTIFACT?',
      text: "This action cannot be undone in the vault.",
      icon: 'warning',
      showCancelButton: true,
      background: '#0f172a',
      color: '#f8fafc',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#334155',
      confirmButtonText: 'DELETE PERMANENTLY',
      customClass: {
        popup: 'rounded-[2rem] border border-slate-800'
      }
    });

    if (!result.isConfirmed) return;

    try {
      await API.delete(`${ENDPOINTS.PRODUCTS}/${id}`);
      Swal.fire({ title: 'ERASED', icon: 'success', background: '#0f172a', color: '#fff' });
      fetchInventory();
    } catch (err) {
      Swal.fire({ title: 'FAILED', text: err.response?.data?.error, icon: 'error', background: '#0f172a' });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {

      await API.patch(`${ENDPOINTS.PRODUCTS}/${selectedProduct.id}`, {
        name: selectedProduct.name,
        price: parseFloat(selectedProduct.price),
      });
      setIsEditOpen(false);
      Swal.fire({ title: 'UPDATED', icon: 'success', background: '#0f172a', timer: 1500 });
      fetchInventory();
    } catch (err) {
      Swal.fire({ title: 'UPDATE FAILED', icon: 'error', background: '#0f172a' });
    }
  };

  return (
    <div className="animate-in fade-in duration-700">

      {/* Header - Horizontal Minimalist Style */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-16 gap-8">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mb-1 ml-1">
            Seller_Control_Panel
          </span>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none italic">
            Architect <span className="text-purple-500">Inventory.</span>
          </h2>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest hover:shadow-[0_0_25px_rgba(168,85,247,0.2)] transition-all transform hover:-translate-y-1 active:scale-95"
        >
          <Plus size={18} />
          Mint New Asset
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-6">
          <div className="relative">
            <Loader2 className="animate-spin text-purple-500" size={48} />
            <div className="absolute inset-0 blur-xl bg-purple-500/10 animate-pulse"></div>
          </div>
          <p className="text-slate-500 font-black tracking-[0.3em] text-[10px] uppercase">Scanning Secure Vault...</p>
        </div>
      ) : (
        <>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map(p => (
                <ArtifactCard
                  key={p.id}
                  product={p}
                  currentUserId={user?.id}
                  actionButton={
                    <div className="flex gap-1.5 ml-4">
                      <button
                        onClick={() => { setSelectedProduct(p); setIsEditOpen(true); }}
                        className="p-2.5 bg-slate-800/40 text-purple-400 rounded-xl hover:bg-purple-500 hover:text-white transition-all border border-slate-800/50 group"
                        title="Edit Artifact"
                      >
                        <Edit3 size={14} className="group-hover:scale-110 transition-transform" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2.5 bg-slate-800/40 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-slate-800/50 group"
                        title="Delete Artifact"
                      >
                        <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  }
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-slate-800 rounded-[3rem]">
              <Package size={48} className="text-slate-800 mb-4" />
              <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">No artifacts detected in your sector.</p>
            </div>
          )}
        </>
      )}

      {/* Edit Modal - Improved UI */}
      {isEditOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] p-10 relative shadow-2xl overflow-hidden">
            {/* Top decorative line */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-blue-700" />

            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Edit Protocol</h3>
                <p className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">Overwriting Asset Metadata</p>
              </div>
              <button onClick={() => setIsEditOpen(false)} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-8">
              <div className="space-y-2">
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Asset Name</label>
                <input
                  value={selectedProduct.name}
                  className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all text-sm font-bold"
                  onChange={e => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Price (Credits)</label>
                <input
                  type="number"
                  value={selectedProduct.price}
                  className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all font-mono text-sm"
                  onChange={e => setSelectedProduct({ ...selectedProduct, price: e.target.value })}
                />
              </div>

              <button type="submit" className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-purple-500 hover:text-white transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-[10px]">
                <Save size={18} />
                Synchronize Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerInventory;