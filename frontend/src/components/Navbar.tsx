import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, Search, ShoppingBag, Package, Activity, Layers, Cpu } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white shadow-lg shadow-rose-600/30 group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <span className="text-xl font-black tracking-wider text-white">
                SALE<span className="text-rose-500">STORM</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/search"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                  isActive('/search')
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Search Engine</span>
              </Link>

              <Link
                to="/hld"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                  isActive('/hld')
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Layers className="w-4 h-4 text-rose-400" />
                <span>HLD</span>
              </Link>

              <Link
                to="/lld"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                  isActive('/lld')
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>LLD Visualizer</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Interactive
                </span>
              </Link>

              <Link
                to="/orders"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                  isActive('/orders')
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>My Orders</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/cart"
              className="p-2 text-slate-300 hover:text-white relative hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
            </Link>

            <Link
              to="/admin/flash-sale"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 hover:from-rose-500 hover:to-rose-400 transition-all flex items-center space-x-2 animate-pulse"
            >
              <Activity className="w-4 h-4" />
              <span>Flash Sale Demo Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
