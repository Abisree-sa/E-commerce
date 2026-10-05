import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { Search, Filter, Database, Zap, Star, ArrowUpDown } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [sort, setSort] = useState('relevance');
  const [page, setPage] = useState(1);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const executeSearch = async () => {
    setLoading(true);
    try {
      const data = await api.search({
        q: query,
        category,
        brand,
        minPrice: minPrice !== '' ? minPrice : undefined,
        maxPrice: maxPrice !== '' ? maxPrice : undefined,
        sort,
        page,
        size: 12,
      });
      setSearchResult(data);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeSearch();
  }, [category, brand, sort, page]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    executeSearch();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Bar Header */}
      <div className="glass-panel p-6 rounded-3xl border-slate-800 space-y-4">
        <form onSubmit={handleFormSubmit} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search millions of products (e.g. running shoes, Sony, laptop)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 text-sm"
            />
          </div>

          <button
            type="submit"
            className="px-8 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 transition-colors"
          >
            Search Catalog
          </button>
        </form>

        {searchResult && (
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-4 gap-2">
            <div>Found <span className="font-bold text-white">{searchResult.totalHits}</span> results</div>
            
            {/* Redis Cache Status Indicator */}
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Cache Engine:</span>
              <span className={`px-2.5 py-1 rounded-md font-bold flex items-center space-x-1 ${searchResult.cached ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'}`}>
                <Zap className="w-3 h-3 fill-current" />
                <span>{searchResult.cached ? 'REDIS CACHE HIT' : 'OPENSEARCH INDEX MISS'}</span>
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Multi-facet Filter Sidebar */}
        <div className="glass-panel p-6 rounded-3xl border-slate-800 space-y-6 h-fit">
          <h3 className="font-bold text-white text-base flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Filter className="w-4 h-4 text-rose-400" />
            <span>Search Filters</span>
          </h3>

          <div className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 text-sm focus:outline-none focus:border-rose-500"
              >
                <option value="">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="footwear">Footwear</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Brand</label>
              <select
                value={brand}
                onChange={(e) => { setBrand(e.target.value); setPage(1); }}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 text-sm focus:outline-none focus:border-rose-500"
              >
                <option value="">All Brands</option>
                <option value="Nike">Nike</option>
                <option value="Sony">Sony</option>
                <option value="SalestormTech">SalestormTech</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Price Range ($)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value !== '' ? Number(e.target.value) : '')}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value !== '' ? Number(e.target.value) : '')}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Sort Order</label>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 text-sm focus:outline-none focus:border-rose-500"
              >
                <option value="relevance">Relevance</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating_desc">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Search Results Grid */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="text-center py-20 text-slate-500">Querying search engine index...</div>
          ) : searchResult && searchResult.items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResult.items.map((item: any) => (
                <div key={item.id} className="glass-panel rounded-2xl p-5 border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group">
                  <div>
                    <div className="relative h-48 rounded-xl overflow-hidden mb-4 bg-slate-900">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      {item.flashSale && (
                        <div className="absolute top-2 left-2 px-2.5 py-1 rounded bg-rose-600 text-white text-xs font-black uppercase tracking-wider shadow">
                          FLASH SALE
                        </div>
                      )}
                    </div>

                    <h3 className="font-bold text-white text-base line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{item.description}</p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                    <div className="text-2xl font-black text-rose-500">${item.price}</div>
                    <Link
                      to={`/product/${item.id}`}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-white text-xs font-bold transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-12 text-center text-slate-400 space-y-3">
              <Database className="w-12 h-12 text-slate-600 mx-auto" />
              <div className="text-lg font-bold text-white">No products found matching filters</div>
              <div className="text-xs text-slate-500">Try adjusting your search keywords or resetting price range.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
