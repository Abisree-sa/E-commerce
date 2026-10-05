import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Package, Clock, CheckCircle, Truck, MapPin, AlertCircle } from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const data = await api.getOrders('cust_demo');
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'PROCESSING': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'SHIPPED': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'DELIVERED': return 'bg-emerald-600 text-white border-emerald-500';
      case 'CANCELLED': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  if (loading) return <div className="text-center py-24 text-slate-500">Fetching order history...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white flex items-center space-x-3">
          <Package className="w-8 h-8 text-rose-500" />
          <span>MY ORDERS</span>
        </h1>
        <p className="text-slate-400 text-xs mt-1">Real-time order state machine timeline and PaymentSucceeded durable outbox tracking.</p>
      </div>

      {orders.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-3 border-slate-800 text-slate-400">
          <Package className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="text-lg font-bold text-white">No Orders Placed Yet</div>
          <div className="text-xs">Complete a flash checkout or run the flash sale simulator to see real-time order states.</div>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.orderId} className="glass-panel rounded-3xl p-6 border-slate-800 space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800/80 pb-4 gap-2">
                <div>
                  <div className="text-xs text-slate-400">Order ID: <span className="font-bold text-white font-mono">{order.orderId}</span></div>
                  <div className="text-xs text-slate-500">Payment ID: <span className="font-mono text-slate-400">{order.paymentId}</span></div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <div className="text-xl font-black text-white">${order.totalAmount}</div>
                </div>
              </div>

              {/* Order State Transition Timeline */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-900 space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Order State Machine Progression</div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold">CREATED</span>
                  <span className="text-slate-600">→</span>
                  <span className={`px-2 py-0.5 rounded font-semibold ${order.status !== 'CREATED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>CONFIRMED</span>
                  <span className="text-slate-600">→</span>
                  <span className={`px-2 py-0.5 rounded font-semibold ${['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status) ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>PROCESSING</span>
                  <span className="text-slate-600">→</span>
                  <span className={`px-2 py-0.5 rounded font-semibold ${['SHIPPED', 'DELIVERED'].includes(order.status) ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>SHIPPED</span>
                  <span className="text-slate-600">→</span>
                  <span className={`px-2 py-0.5 rounded font-semibold ${order.status === 'DELIVERED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>DELIVERED</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>Shipping Address: {order.shippingAddress}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
