import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api/axiosConfig';
import { ENDPOINTS, CATEGORIES } from '../../constants/apiEndpoints';
import { ShoppingBag, Search, Loader2, Package, ArrowRight, Lock, ExternalLink, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import ArtifactCard from '../../components/ArtifactCard';

const Marketplace = () => {
  const navigate = useNavigate();
  const { user, verifyUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const isLoggedIn = !!user;

  useEffect(() => {
    document.title = "Network Deployments :: Architect X";
  }, []);

  const fetchPublicProducts = async () => {
    try {
      const response = await API.get(ENDPOINTS.PRODUCTS);
      const allProducts = response.data.data || [];
      const visibleProducts = allProducts.filter(p => !p.isHidden);
      setProducts(isLoggedIn ? visibleProducts : visibleProducts.slice(0, 8));
    } catch (err) {
      console.error("Failed to fetch marketplace:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicProducts();
  }, [isLoggedIn]);

  const handleBuy = async (product) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    // Prevention Logic: Seller cannot buy own product
    if (user?.id === product.sellerId) {
      Swal.fire({
        title: 'OWNERSHIP DETECTED',
        text: 'Protocol denied: You cannot acquire your own artifact.',
        icon: 'info',
        background: '#0f172a',
        color: '#f8fafc',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

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

  const handleDelete = async (product) => {
    const result = await Swal.fire({
      title: 'TERMINATE ARTIFACT?',
      text: `Are you sure you want to remove ${product.name} from the network? This action is irreversible.`,
      icon: 'warning',
      showCancelButton: true,
      background: '#0f172a',
      color: '#f8fafc',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#334155',
      confirmButtonText: 'DELETE PERMANENTLY',
      customClass: { popup: 'rounded-[2rem] border border-slate-800' }
    });

    if (!result.isConfirmed) return;

    try {
      const response = await API.delete(`${ENDPOINTS.PRODUCTS}/${product.id}`);
      if (response.data.success) {
        Swal.fire({
          title: 'ARTIFACT TERMINATED',
          text: 'The asset has been successfully purged from the grid.',
          icon: 'success',
          background: '#0f172a',
          color: '#f8fafc',
          confirmButtonColor: '#22d3ee'
        });
        fetchPublicProducts(); // Refresh list
      }
    } catch (err) {
      Swal.fire({
        title: 'DELETION FAILED',
        text: err.response?.data?.message || "Protocol error during deletion.",
        icon: 'error',
        background: '#0f172a',
        color: '#f8fafc'
      });
    }
  };

  const [activeCategory, setActiveCategory] = useState('All');

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());

    const prodCategory = p.category || "General";
    let matchesCategory = false;

    if (activeCategory === 'All') {
      matchesCategory = true;
    } else if (activeCategory === 'Other') {
      // If the filter is 'Other', match products that are explicitly 'Other'
      // OR products that have custom strings not in the main predefined categories array
      matchesCategory = prodCategory === 'Other' || !CATEGORIES.includes(prodCategory);
    } else {
      matchesCategory = prodCategory === activeCategory;
    }

    return matchesSearch && matchesCategory;
  });

  const categories = CATEGORIES;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-8 font-sans relative overflow-hidden">

      {!isLoggedIn && (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-600/5 blur-[120px] rounded-full -z-10" />
          <div className="absolute bottom-[-5%] right-[-5%] w-[35%] h-[35%] bg-purple-600/5 blur-[100px] rounded-full -z-10" />
        </>
      )}

      {/* Header & Search Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-8 relative z-10">

        <div className="flex flex-col">
          <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em] mb-1 ml-0.5">
            {isLoggedIn ? 'Vault_Sector_01' : 'Public_Encryption_Preview'}
          </span>

          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
            Network <span className="text-purple-500">Deployments.</span>
          </h2>
        </div>

        <div className="relative w-full max-w-[280px] group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-500 transition-colors"
            size={13}
          />
          <input
            type="text"
            placeholder="SEARCH ARTIFACTS..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/40 border border-slate-800/60 rounded-full outline-none focus:border-cyan-500/40 focus:bg-slate-900/60 transition-all text-[10px] text-white placeholder:text-slate-700 tracking-widest uppercase font-bold"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-3 mb-12 overflow-x-auto pb-4 no-scrollbar relative z-10">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${activeCategory === cat
              ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.1)]'
              : 'bg-slate-900/40 text-slate-500 border-slate-800 hover:border-slate-700 hover:text-slate-300'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="animate-spin text-purple-500" size={48} />
          <p className="text-slate-500 font-black uppercase tracking-widest animate-pulse">Decrypting Inventory...</p>
        </div>
      ) : (
        <>
          <div className="relative z-10">
            {/* Grid with conditional item-level blurring */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 transition-all duration-700">
              {filteredProducts.map((product, index) => (
                <div key={product.id} className={`${!isLoggedIn && index >= 4 ? 'blur-[8px] select-none pointer-events-none opacity-40' : ''} transition-all duration-500`}>
                  <ArtifactCard
                    product={product}
                    currentUserId={user?.id}
                    actionButton={(
                      <div className="flex items-center gap-2">
                        {/* Admin Delete Action */}
                        {user?.role === 'Admin' && (
                          <button
                            onClick={() => handleDelete(product)}
                            className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(239,68,68,0.05)]"
                            title="Purge Artifact"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}

                        {/* Buy or See Yours Action */}
                        {(() => {
                          const isOwner = user?.id === product.sellerId;

                          if (isOwner) {
                            return (
                              <button
                                onClick={() => navigate('/inventory')}
                                className="flex items-center gap-1.5 px-4 py-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl hover:bg-cyan-500 hover:text-white transition-all duration-300 group/btn shadow-[0_0_15px_rgba(34,211,238,0.05)]"
                              >
                                <span className="text-[10px] font-black uppercase tracking-[0.15em]">See Yours</span>
                                <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                              </button>
                            );
                          }

                          return (
                            <button
                              onClick={() => handleBuy(product)}
                              className={`p-3.5 rounded-2xl transition-all duration-300 shadow-lg transform active:scale-95 group/btn ${!isLoggedIn
                                ? 'bg-slate-800 text-cyan-400 hover:bg-cyan-500 hover:text-white'
                                : 'bg-gradient-to-br from-cyan-600 to-purple-600 text-white hover:shadow-cyan-500/20 hover:-translate-y-1'
                                }`}
                            >
                              {!isLoggedIn ? <ArrowRight size={22} /> : <ShoppingBag size={22} title="Initialize Purchase" />}
                            </button>
                          );
                        })()}
                      </div>
                    )}
                  />
                </div>
              ))}
            </div>

            {/* Access Restricted Overlay - Positioned specifically over the bottom half of the grid */}
            {!isLoggedIn && (
              <div className="absolute inset-x-0 bottom-0 top-[40%] z-20 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-t from-[#020617] via-[#020617]/90 to-transparent backdrop-blur-[2px]">
                <div className="p-5 bg-slate-900/80 rounded-full mb-8 border border-slate-700 shadow-2xl shadow-purple-500/20 animate-bounce">
                  <Lock className="text-purple-500" size={40} />
                </div>

                <h3 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter mb-4 max-w-2xl">
                  Want to see more <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">classified</span> artifacts?
                </h3>

                <p className="text-slate-400 max-w-lg mb-8 text-lg font-medium leading-relaxed">
                  There are hundreds of premium system blueprints and foundational artifacts waiting inside the vault.
                </p>

                <Link
                  to="/register"
                  className="group relative flex items-center gap-4 px-12 py-6 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-2xl text-white font-black text-base uppercase tracking-[0.2em] shadow-2xl shadow-purple-500/30 hover:-translate-y-1 transition-all active:scale-95"
                >
                  <span>Initialize Full Access</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <div className="mt-8 flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                  Security Protocol: Layer 7 Decryption Required
                </div>
              </div>
            )}
          </div>
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