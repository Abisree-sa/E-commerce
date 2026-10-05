import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { Zap, Search, ShieldCheck, ArrowRight, Star, ShoppingCart } from 'lucide-react';

export const Home: React.FC = () => {
  const [flashProduct, setFlashProduct] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    api.getProductById('prod_flash_1').then(setFlashProduct).catch(console.error);
    api.getRecommendations().then(setRecommendations).catch(console.error);
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Banner */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-indigo-500/10 blur-3xl -z-10 rounded-full"></div>
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-widest animate-pulse">
            <Zap className="w-4 h-4 fill-current" />
            <span>SALESTORM Flash Sale Active Now</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-none">
            MILLIONS OF PRODUCTS. <br />
            <span className="bg-gradient-to-r from-rose-500 via-amber-400 to-rose-400 bg-clip-text text-transparent">
              ZERO OVERSELLING.
            </span>
          </h1>

          <p className="text-slate-300 text-lg md:text-xl font-normal leading-relaxed">
            High-concurrency e-commerce engine with atomic SQL stock isolation, parameter-aware search caching, outbox pattern durability, and real-time reconciliation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/search"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 text-white font-bold text-base shadow-xl shadow-rose-600/30 hover:scale-105 transition-all flex items-center justify-center space-x-2"
            >
              <Search className="w-5 h-5" />
              <span>Explore Product Search</span>
            </Link>

            <Link
              to="/admin/flash-sale"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-panel text-white font-bold text-base hover:bg-slate-800 transition-all flex items-center justify-center space-x-2 border border-slate-700"
            >
              <Zap className="w-5 h-5 text-amber-400" />
              <span>Launch Flash Sale Demo</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Flash Sale Spotlight Card */}
      {flashProduct && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-panel rounded-3xl p-8 md:p-12 border-rose-500/30 bg-gradient-to-br from-slate-900/90 via-slate-950 to-rose-950/20 relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-rose-500 text-white text-xs font-black uppercase tracking-wider">
                  HOT FLASH SALE ITEM
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white">{flashProduct.name}</h2>
                <p className="text-slate-300 text-sm leading-relaxed">{flashProduct.description}</p>
                
                <div className="flex items-baseline space-x-4">
                  <span className="text-4xl font-black text-rose-500">${flashProduct.price}</span>
                  <span className="text-slate-500 line-through text-lg">$1,799.99</span>
                  <span className="text-emerald-400 text-xs font-bold px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">SAVE 28%</span>
                </div>

                <div className="pt-2 flex items-center space-x-4">
                  <Link
                    to={`/product/${flashProduct.id}`}
                    className="px-6 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 transition-all flex items-center space-x-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>BUY NOW (100 UNITS AVAILABLE)</span>
                  </Link>
                </div>
              </div>

              <div className="relative group flex justify-center">
                <div className="absolute inset-0 bg-rose-500/20 rounded-3xl blur-2xl group-hover:bg-rose-500/30 transition-all"></div>
                <img
                  src={flashProduct.imageUrl}
                  alt={flashProduct.name}
                  className="relative z-10 w-full max-w-md h-72 object-cover rounded-2xl shadow-2xl border border-slate-700/50"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Personalized Recommendations Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-white">PERSONALIZED RECOMMENDATIONS</h2>
            <p className="text-slate-400 text-sm">Weighted algorithm matching category, brand, popularity, and recent behavior</p>
          </div>
          <Link to="/search" className="text-rose-400 text-sm font-bold flex items-center space-x-1 hover:underline">
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendations.map((item) => (
            <div key={item.productId} className="glass-panel rounded-2xl p-5 border-slate-800 hover:border-slate-700 transition-all group flex flex-col justify-between">
              <div>
                <div className="relative h-44 rounded-xl overflow-hidden mb-4 bg-slate-900">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-amber-400 text-xs font-bold flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-current" />
                    <span>Score: {item.recommendationScore}</span>
                  </div>
                </div>
                <h3 className="font-bold text-white text-base line-clamp-1">{item.name}</h3>
                <div className="text-xs text-slate-400 capitalize mt-1">{item.brand} • {item.category}</div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                <div className="text-xl font-black text-white">${item.price}</div>
                <Link
                  to={`/product/${item.productId}`}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white text-xs font-bold transition-colors"
                >
                  View Product
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
