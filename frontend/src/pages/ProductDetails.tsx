import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { ShoppingBag, Zap, ShieldCheck, Star, Clock, CheckCircle } from 'lucide-react';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<any>(null);
  const [inventory, setInventory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    if (id) {
      Promise.all([
        api.getProductById(id),
        api.getInventory(id).catch(() => ({ availableQuantity: 100 })),
      ]).then(([prodData, invData]) => {
        setProduct(prodData);
        setInventory(invData);
        setLoading(false);
      }).catch(err => {
        console.error('Failed to load product details:', err);
        setLoading(false);
      });
    }
  }, [id]);

  const handleBuyNow = async () => {
    if (!product) return;
    setBuying(true);

    try {
      // Direct high-speed reservation & checkout flow
      const res = await api.processCheckout({
        customerId: 'cust_demo',
        productId: product.id,
        productName: product.name,
        quantity: 1,
        amount: product.price,
        shippingAddress: '123 Innovation Way, Tech City',
      });

      if (res.status === 'SUCCESS') {
        navigate('/orders');
      } else {
        alert(`Checkout Status: ${res.status} - ${res.message}`);
      }
    } catch (err: any) {
      alert(`Checkout Error: ${err.message}`);
    } finally {
      setBuying(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await api.addToCart('cust_demo', {
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        quantity: 1,
        imageUrl: product.imageUrl,
      });
      alert('Added product to shopping cart!');
    } catch (err: any) {
      alert('Failed to add to cart: ' + err.message);
    }
  };

  if (loading) return <div className="text-center py-24 text-slate-500">Loading product data...</div>;
  if (!product) return <div className="text-center py-24 text-rose-500">Product not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="relative rounded-3xl overflow-hidden glass-panel p-4 border-slate-800">
          <img src={product.imageUrl} alt={product.name} className="w-full h-96 object-cover rounded-2xl" />
          {product.flashSale && (
            <div className="absolute top-6 left-6 px-4 py-1.5 rounded-full bg-rose-600 text-white font-black text-xs uppercase tracking-widest shadow-xl flex items-center space-x-1.5">
              <Zap className="w-4 h-4 fill-current" />
              <span>FLASH SALE LIMITED ITEM</span>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <div className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-1">{product.brand} • {product.category}</div>
            <h1 className="text-3xl md:text-4xl font-black text-white">{product.name}</h1>
            <div className="flex items-center space-x-2 mt-2">
              <div className="flex text-amber-400">
                <Star className="w-4 h-4 fill-current" />
              </div>
              <span className="text-sm font-bold text-white">{product.rating} / 5.0</span>
              <span className="text-xs text-slate-500">(1,420 Verified Reviews)</span>
            </div>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed">{product.description}</p>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Inventory Status:</span>
              <span className="font-bold text-emerald-400 flex items-center space-x-1">
                <CheckCircle className="w-4 h-4" />
                <span>{inventory ? inventory.availableQuantity : 100} Units Stock Available</span>
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Reservation Lock:</span>
              <span className="font-bold text-slate-200">10 Minutes Atomic TTL</span>
            </div>
          </div>

          <div className="flex items-baseline space-x-4">
            <span className="text-4xl font-black text-white">${product.price}</span>
            <span className="text-slate-500 line-through text-lg">${(Number(product.price) * 1.25).toFixed(2)}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={handleBuyNow}
              disabled={buying}
              className="flex-1 py-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 text-white font-bold text-base shadow-xl shadow-rose-600/30 hover:scale-[1.02] transition-all flex items-center justify-center space-x-2"
            >
              <Zap className="w-5 h-5 fill-current" />
              <span>{buying ? 'RESERVING INVENTORY...' : 'FLASH BUY NOW'}</span>
            </button>

            <button
              onClick={handleAddToCart}
              className="px-6 py-4 rounded-xl glass-panel text-white font-bold text-base hover:bg-slate-800 transition-colors border border-slate-700 flex items-center justify-center space-x-2"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
