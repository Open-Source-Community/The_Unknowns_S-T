import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api/axiosConfig';
import { ENDPOINTS } from '../../constants/apiEndpoints';
import { ShoppingBag, Search, Loader2, Package, ArrowRight, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import ArtifactCard from '../../components/ArtifactCard';

const Marketplace = () => {
  const { user, verifyUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

const isLoggedIn = !!user;

  const fetchPublicProducts = async () => {
    try {
      const response = await API.get(ENDPOINTS.PRODUCTS);
      const allProducts = response.data.data || [];
      const visibleProducts = allProducts.filter(p => !p.isHidden);
     setProducts(isLoggedIn ? visibleProducts : visibleProducts.slice(0, 10));
    } catch (err) {
      console.error("Failed to fetch marketplace:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicProducts();
  },[isLoggedIn]);

  const handleBuy = async (product) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

    const result = await Swal.fire({
      title: 'ACQUIRE ARTIFACT?',
      text: `Confirm acquisition of ${product.name} for $${product.price}`,
      icon: 'question',
      showCancelButton: true,
      background: '#0f172a',
      color: '#f8fafc',
      confirmButtonColor: '#a855f7',
      cancelButtonColor: '#334155',
      confirmButtonText: 'INITIALIZE PURCHASE',
      customClass: { popup: 'rounded-[2rem] border border-slate-800' }
    });

    if (!result.isConfirmed) return;

    const userBalance = parseFloat(user?.wallet?.realBalance || user?.balance || 0);
    if (userBalance < product.price) {
      Swal.fire({
        title: 'INSUFFICIENT CREDITS',
        text: 'Please top up your vault wallet.',
        icon: 'error',
        background: '#0f172a',
        color: '#f8fafc',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    try {
      const response = await API.post(ENDPOINTS.ORDERS, 
  { items: [{ productId: product.id, quantity: 1 }] },
  { headers: { 'Idempotency-Key': `buy-${product.id}-${Date.now()}` } }
);
      
      if (response.data.success) {
        await Swal.fire({
          title: 'ARTIFACT SECURED!',
          text: `${product.name} is now in your collection.`,
          icon: 'success',
          background: '#0f172a',
          color: '#f8fafc',
          confirmButtonColor: '#22d3ee'
        });
        await verifyUser(); 
      }
    } catch (err) {
      Swal.fire({
        title: 'TRANSACTION FAILED',
        text: err.response?.data?.message || "Purchase failed.",
        icon: 'error',
        background: '#0f172a',
        color: '#f8fafc'
      });
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

 return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-8 font-sans relative overflow-hidden">
      
      
      {!isLoggedIn && (
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-fuchsia-600/10 blur-[120px] rounded-full -z-10" />
      )}

      {/* Header & Search Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 relative z-10">
  
<div className="flex flex-col">
    <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em] mb-1 ml-0.5">
      {isLoggedIn ? 'Vault_Sector_01' : 'Public_Encryption_Preview'}
    </span>
    
    <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
      Marketplace<span className="text-fuchsia-600">.</span>
    </h2>
  </div>

  <div className="relative w-full max-w-[280px] group">
    <Search 
      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-fuchsia-500 transition-colors" 
      size={13} 
    />
    <input 
      type="text" 
      placeholder="SEARCH..." 
      className="w-full pl-10 pr-4 py-2 bg-slate-900/40 border border-slate-800/60 rounded-full outline-none focus:border-fuchsia-500/40 focus:bg-slate-900/60 transition-all text-[10px] text-white placeholder:text-slate-700 tracking-widest"
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>
        
      
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="animate-spin text-purple-500" size={48} />
          <p className="text-slate-500 font-black uppercase tracking-widest animate-pulse">Decrypting Inventory...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 relative z-10">
            {filteredProducts.map((product) => (
              <ArtifactCard 
                key={product.id} 
                product={product}
                actionButton={
                  <button 
                    onClick={() => handleBuy(product)}
                    className={`p-4 rounded-2xl transition-all duration-300 shadow-lg transform active:scale-95 group/btn ${
                      !isLoggedIn 
                      ? 'bg-slate-800 text-cyan-400 hover:bg-cyan-500 hover:text-white'
                      : user?.role !== 'Buyer' 
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50' 
                        : 'bg-gradient-to-br from-purple-600 to-fuchsia-700 text-white hover:shadow-purple-500/20 hover:-translate-y-1'
                    }`}
                  >
                    {!isLoggedIn ? <ArrowRight size={22} /> : <ShoppingBag size={22} />}
                  </button>
                }
              />
            ))}
          </div>
          
          {!isLoggedIn && products.length >= 10 && (
            <div className="mt-20 py-16 border-t border-slate-800/50 flex flex-col items-center text-center relative z-10">
              <div className="p-4 bg-slate-900 rounded-full mb-6 border border-slate-800">
                <Lock className="text-fuchsia-500" size={32} />
              </div>
              <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">
                Want to see more <span className="text-fuchsia-500">classified</span> assets?
              </h3>
              <p className="text-slate-500 max-w-md mb-8 font-medium">
                There are hundreds of premium artifacts waiting inside. Create an account to gain full access to the vault.
              </p>
              <Link 
                to="/register"
                className="group relative flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-2xl text-white font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-purple-900/40 hover:-translate-y-1 transition-all"
              >
                <span>Initialize Full Access</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && filteredProducts.length === 0 && (
        <div className="text-center py-40 border-2 border-dashed border-slate-800 rounded-[3rem]">
          <Package size={64} className="mx-auto text-slate-800 mb-4" />
          <p className="text-slate-600 font-black uppercase tracking-widest italic">
            No artifacts detected in the current sector.
          </p>
        </div>
      )}
    </div>
  );
};

export default Marketplace;