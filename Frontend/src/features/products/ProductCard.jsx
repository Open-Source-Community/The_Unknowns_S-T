import React from 'react';
import { ShoppingCart, Tag } from 'lucide-react';

const ProductCard = ({ product, onBuy }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-5 hover:shadow-xl transition-all group">
      <div className="h-48 bg-slate-100 rounded-2xl mb-4 overflow-hidden relative">
        <img src={product.image || 'https://via.placeholder.com/300'} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-blue-600 font-bold text-sm shadow-sm">
          ${product.price}
        </span>
      </div>
      
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-slate-800 text-lg">{product.name}</h3>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{product.category}</span>
      </div>
      
      <p className="text-slate-500 text-sm mb-6 line-clamp-2">{product.description}</p>
      
      <button 
        onClick={() => onBuy(product)}
        className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-blue-600 transition-colors shadow-lg shadow-slate-200"
      >
        <ShoppingCart size={18} />
        <span>Buy Now</span>
      </button>
    </div>
  );
};

export default ProductCard;