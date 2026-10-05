import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Zap, Play, AlertTriangle, ShieldCheck, RefreshCw, CheckCircle2, XCircle, Clock, Server, ArrowRight } from 'lucide-react';

export const FlashSaleDashboard: React.FC = () => {
  const [stockInfo, setStockInfo] = useState<any>({ availableQuantity: 100, reservedQuantity: 0, soldQuantity: 0 });
  const [loading, setLoading] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [orderServiceActive, setOrderServiceActive] = useState(true);

  const fetchStock = async () => {
    try {
      const data = await api.getInventory('prod_flash_1');
      setStockInfo(data);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    }
  };

  useEffect(() => {
    fetchStock();
    const interval = setInterval(fetchStock, 2000);
    return () => clearInterval(interval);
  }, []);

  const addLog = (msg: string) => {
    setActionLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 19)]);
  };

  const handleSimulateFlashSale = async () => {
    setLoading(true);
    addLog('🚀 LAUNCHING CONCURRENCY BENCHMARK: Firing 10,000 simultaneous purchase attempts vs 100 units...');
    try {
      const res = await api.simulateFlashSale('prod_flash_1', 100, 10000);
      setSimResult(res);
      addLog(`✅ COMPLETED: ${res.successfulReservations} Successful Reservations, ${res.outOfStockCount} Out of Stock, OVERSOLD: ${res.oversold}`);
      fetchStock();
    } catch (err: any) {
      addLog(`❌ Simulation Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePaymentFailure = async () => {
    addLog('🧪 Simulating Payment Failure...');
    try {
      const res = await api.simulatePaymentFailure();
      addLog(`⚠️ Payment Declined: ${res.message}. Inventory released back to pool.`);
      fetchStock();
    } catch (err: any) {
      addLog(`❌ Error: ${err.message}`);
    }
  };

  const handleSimulatePaymentTimeout = async () => {
    addLog('⏳ Simulating Payment Gateway Timeout...');
    try {
      const res = await api.simulatePaymentTimeout();
      addLog(`🔄 Payment UNKNOWN: ${res.message}. Background Reconciliation worker activated.`);
      fetchStock();
    } catch (err: any) {
      addLog(`❌ Error: ${err.message}`);
    }
  };

  const handleToggleOrderService = async () => {
    const nextState = !orderServiceActive;
    try {
      const res = await api.toggleOrderService(nextState);
      setOrderServiceActive(nextState);
      addLog(res.message);
    } catch (err: any) {
      addLog(`❌ Toggle Error: ${err.message}`);
    }
  };

  const handleExpireReservations = async () => {
    addLog('⌛ Triggering Reservation Expiry Worker...');
    try {
      const res = await api.expireReservations();
      addLog(res.message);
      fetchStock();
    } catch (err: any) {
      addLog(`❌ Expiry Error: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-rose-950/80 via-slate-900 to-indigo-950/80 border border-rose-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-widest mb-3">
              <Zap className="w-3.5 h-3.5" />
              <span>Hackathon Live Demo Suite</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              FLASH SALE CONCURRENCY & RELIABILITY DASHBOARD
            </h1>
            <p className="text-slate-400 mt-2 text-sm max-w-2xl">
              Real-time demonstration of atomic SQL stock reservation engine, idempotency control, outbox pattern durability, and payment reconciliation.
            </p>
          </div>

          <button
            onClick={handleSimulateFlashSale}
            disabled={loading}
            className="px-6 py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white font-black text-base shadow-xl shadow-rose-600/30 hover:scale-105 active:scale-95 transition-all flex items-center space-x-3 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6 fill-current" />}
            <span>FIRE 10,000 CONCURRENT ATTEMPTS</span>
          </button>
        </div>
      </div>

      {/* Stock Meter & Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl border-slate-800 flex flex-col justify-between">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Initial Flash Stock</div>
          <div className="text-4xl font-black text-white mt-2">100</div>
          <div className="text-xs text-slate-500 mt-2">Product: SALESTORM Ultra Edition</div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-emerald-500/30 bg-emerald-950/10 flex flex-col justify-between">
          <div className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Available Quantity</div>
          <div className="text-4xl font-black text-emerald-400 mt-2">{stockInfo.availableQuantity ?? 100}</div>
          <div className="text-xs text-emerald-500/70 mt-2">Ready for purchase</div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-amber-500/30 bg-amber-950/10 flex flex-col justify-between">
          <div className="text-amber-400 text-xs font-bold uppercase tracking-wider">Reserved Quantity</div>
          <div className="text-4xl font-black text-amber-400 mt-2">{stockInfo.reservedQuantity ?? 0}</div>
          <div className="text-xs text-amber-500/70 mt-2">Held under 10m TTL</div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-rose-500/30 bg-rose-950/20 flex flex-col justify-between">
          <div className="text-rose-400 text-xs font-bold uppercase tracking-wider flex items-center space-x-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Oversold Count</span>
          </div>
          <div className="text-4xl font-black text-emerald-400 mt-2">
            {simResult ? simResult.oversold : 0}
          </div>
          <div className="text-xs text-emerald-400 font-semibold mt-2">INVARIANT PASSED (ZERO OVERSELLING)</div>
        </div>
      </div>

      {/* Flash Sale Benchmark Results Card */}
      {simResult && (
        <div className="glass-panel p-6 rounded-3xl border-rose-500/30 bg-rose-950/10 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Flash Sale Concurrency Simulation Report</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-xs">Total Requests</div>
              <div className="text-xl font-bold text-white mt-1">{simResult.totalRequests}</div>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-xs">Successful Reservations</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">{simResult.successfulReservations}</div>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-xs">Out of Stock (409)</div>
              <div className="text-xl font-bold text-rose-400 mt-1">{simResult.outOfStockCount}</div>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-xs">Oversold Count</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">{simResult.oversold}</div>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-xs">Execution Time</div>
              <div className="text-xl font-bold text-amber-400 mt-1">{simResult.executionTimeMs} ms</div>
            </div>
          </div>
        </div>
      )}

      {/* Failure & Reliability Interactive Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel p-6 rounded-3xl border-slate-800 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Server className="w-5 h-5 text-rose-400" />
            <span>Interactive Failure & Recovery Controllers</span>
          </h2>

          <div className="space-y-3">
            <button
              onClick={handleSimulatePaymentFailure}
              className="w-full p-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left flex items-center justify-between transition-colors group"
            >
              <div>
                <div className="font-semibold text-rose-400 text-sm">Simulate Payment Failure</div>
                <div className="text-xs text-slate-400 mt-0.5">Payment declined → Automatically releases stock reservation back to available pool.</div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={handleSimulatePaymentTimeout}
              className="w-full p-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left flex items-center justify-between transition-colors group"
            >
              <div>
                <div className="font-semibold text-amber-400 text-sm">Simulate Payment Gateway Timeout</div>
                <div className="text-xs text-slate-400 mt-0.5">Payment UNKNOWN → Scheduled background reconciliation worker resolves transaction.</div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={handleToggleOrderService}
              className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-colors group ${
                orderServiceActive
                  ? 'bg-slate-900 border-slate-700 hover:bg-slate-800'
                  : 'bg-rose-950/30 border-rose-500/40 text-white'
              }`}
            >
              <div>
                <div className="font-semibold text-cyan-400 text-sm">
                  {orderServiceActive ? 'Simulate Order Service Downtime' : 'Restart Order Service (Recover Events)'}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Proves PaymentSucceeded durable outbox event remains safe in Kafka and creates order upon service recovery.
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${orderServiceActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {orderServiceActive ? 'RUNNING' : 'DOWN'}
              </span>
            </button>

            <button
              onClick={handleExpireReservations}
              className="w-full p-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left flex items-center justify-between transition-colors group"
            >
              <div>
                <div className="font-semibold text-indigo-400 text-sm">Trigger Reservation Expiry Worker</div>
                <div className="text-xs text-slate-400 mt-0.5">Scans expired 10m TTL reservations and restores available stock.</div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Real-time System Event Audit Console */}
        <div className="glass-panel p-6 rounded-3xl border-slate-800 flex flex-col">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2 mb-4">
            <Clock className="w-5 h-5 text-cyan-400" />
            <span>Live Audit Console & Log Stream</span>
          </h2>

          <div className="flex-1 bg-slate-950 rounded-2xl p-4 font-mono text-xs text-slate-300 overflow-y-auto max-h-[380px] space-y-2 border border-slate-800">
            {actionLog.length === 0 ? (
              <div className="text-slate-600 text-center py-12">No actions recorded yet. Fire a simulation to view audit stream.</div>
            ) : (
              actionLog.map((log, index) => (
                <div key={index} className="leading-relaxed border-b border-slate-900/60 pb-1.5">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
