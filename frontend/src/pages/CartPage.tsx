import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export const CartPage: React.FC = () => {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const data = await api.getCart('cust_demo');
      setCart(data);
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = async (productId: string) => {
    try {
      await api.removeFromCart('cust_demo', productId);
      fetchCart();
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  if (loading) return <div className="text-center py-24 text-slate-500">Loading shopping cart...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <h1 className="text-3xl font-black text-white flex items-center space-x-3">
        <ShoppingBag className="w-8 h-8 text-rose-500" />
        <span>SHOPPING CART</span>
      </h1>

      {!cart || cart.items.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-4 border-slate-800">
          <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="text-lg font-bold text-white">Your Cart is Currently Empty</div>
          <p className="text-xs text-slate-400">Items added to your cart do not reserve inventory permanently until checkout.</p>
          <Link
            to="/search"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-600/30 hover:bg-rose-500 transition-colors"
          >
            <span>Browse Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-6 border-slate-800 space-y-4">
            {cart.items.map((item: any) => (
              <div key={item.productId} className="flex items-center justify-between p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
                <div className="flex items-center space-x-4">
                  <img src={item.imageUrl || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80"} alt={item.productName} className="w-16 h-16 object-cover rounded-xl" />
                  <div>
                    <h3 className="font-bold text-white text-base">{item.productName}</h3>
                    <div className="text-xs text-slate-400">Qty: {item.quantity} • Unit Price: ${item.unitPrice}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-xl font-black text-white">${(Number(item.unitPrice) * item.quantity).toFixed(2)}</div>
                  <button
                    onClick={() => handleRemove(item.productId)}
                    className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-panel p-6 rounded-3xl border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <div className="text-xs text-slate-400">Total Cart Amount:</div>
              <div className="text-3xl font-black text-rose-500">${cart.totalPrice ? cart.totalPrice.toFixed(2) : '0.00'}</div>
            </div>

            <button
              onClick={async () => {
                const item = cart.items[0];
                if (!item) return;
                const res = await api.processCheckout({
                  customerId: 'cust_demo',
                  productId: item.productId,
                  productName: item.productName,
                  quantity: item.quantity,
                  amount: cart.totalPrice,
                  shippingAddress: '123 Innovation Way, Tech City',
                });
                if (res.status === 'SUCCESS') navigate('/orders');
                else alert(`Checkout status: ${res.status}`);
              }}
              className="w-full md:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 text-white font-bold text-base shadow-xl shadow-rose-600/30 hover:scale-105 transition-all"
            >
              PROCEED TO FLASH CHECKOUT
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
