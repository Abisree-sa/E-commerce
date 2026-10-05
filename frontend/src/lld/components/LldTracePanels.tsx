import React, { useState } from 'react';
import { attributeTraceDetails, methodTraceDetails, apiTraceDetails, eventTraceDetails } from '../data/lldDiagramsData';
import { Database, FileCode, Server, Zap, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface LldTracePanelsProps {
  activeMode: string;
}

export const LldTracePanels: React.FC<LldTracePanelsProps> = ({ activeMode }) => {
  const [selectedAttrKey, setSelectedAttrKey] = useState<string>('inventory.availableQuantity');
  const [selectedMethodKey, setSelectedMethodKey] = useState<string>('reserveInventory');
  const [selectedApiKey, setSelectedApiKey] = useState<string>('POST /api/v1/reservations');
  const [selectedEventKey, setSelectedEventKey] = useState<string>('PaymentSucceeded');

  if (activeMode === 'none') return null;

  return (
    <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
      {/* Attribute Trace Mode */}
      {activeMode === 'attribute' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">TRACE ATTRIBUTE MODE</h3>
            </div>
            <select
              value={selectedAttrKey}
              onChange={(e) => setSelectedAttrKey(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-amber-300 font-mono text-xs rounded-xl px-3 py-1.5 focus:outline-none"
            >
              {Object.keys(attributeTraceDetails).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>

          {attributeTraceDetails[selectedAttrKey] && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">DB Column & Table</span>
                <p className="text-xs font-mono font-bold text-amber-300">{attributeTraceDetails[selectedAttrKey].dbColumn}</p>
                <p className="text-[10px] text-slate-400">Type: {attributeTraceDetails[selectedAttrKey].type}</p>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">JPA Entity Field</span>
                <p className="text-xs font-mono font-bold text-emerald-300">{attributeTraceDetails[selectedAttrKey].jpaField}</p>
                <p className="text-[10px] text-slate-400">{attributeTraceDetails[selectedAttrKey].javaClass}</p>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">Service Method & Concurrency</span>
                <p className="text-xs font-mono font-bold text-rose-300">{attributeTraceDetails[selectedAttrKey].usedByServiceMethod}</p>
                <p className="text-[10px] text-slate-400">{attributeTraceDetails[selectedAttrKey].concurrencyStrategy}</p>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">Test Coverage</span>
                <p className="text-xs font-mono font-bold text-cyan-300">{attributeTraceDetails[selectedAttrKey].testCoverage}</p>
                <p className="text-[10px] text-slate-400">{attributeTraceDetails[selectedAttrKey].businessPurpose}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Method Trace Mode */}
      {activeMode === 'method' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <FileCode className="w-5 h-5 text-rose-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">TRACE METHOD MODE</h3>
            </div>
            <select
              value={selectedMethodKey}
              onChange={(e) => setSelectedMethodKey(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-rose-300 font-mono text-xs rounded-xl px-3 py-1.5 focus:outline-none"
            >
              {Object.keys(methodTraceDetails).map((key) => (
                <option key={key} value={key}>
                  {key}()
                </option>
              ))}
            </select>
          </div>

          {methodTraceDetails[selectedMethodKey] && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">Class & Called By</span>
                <p className="text-xs font-mono font-bold text-rose-300">{methodTraceDetails[selectedMethodKey].className}</p>
                <p className="text-[10px] text-slate-400">Caller: {methodTraceDetails[selectedMethodKey].calledBy}</p>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">Inputs & Validation</span>
                <p className="text-xs font-mono text-amber-200">{methodTraceDetails[selectedMethodKey].inputs}</p>
                <p className="text-[10px] text-slate-400">Rules: {methodTraceDetails[selectedMethodKey].validationRules}</p>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">Transaction & Database Updates</span>
                <p className="text-xs font-mono font-bold text-cyan-300">{methodTraceDetails[selectedMethodKey].transactionBoundary}</p>
                <p className="text-[10px] font-mono text-slate-400 truncate">{methodTraceDetails[selectedMethodKey].databaseUpdates}</p>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">Events & Error Handling</span>
                <p className="text-xs font-mono text-emerald-300">{methodTraceDetails[selectedMethodKey].eventsEmitted}</p>
                <p className="text-[10px] text-slate-400">{methodTraceDetails[selectedMethodKey].errorHandling}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* API Trace Mode */}
      {activeMode === 'api' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Server className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">TRACE API MODE</h3>
            </div>
            <select
              value={selectedApiKey}
              onChange={(e) => setSelectedApiKey(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-cyan-300 font-mono text-xs rounded-xl px-3 py-1.5 focus:outline-none"
            >
              {Object.keys(apiTraceDetails).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>

          {apiTraceDetails[selectedApiKey] && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">Endpoint & Controller</span>
                <p className="text-xs font-mono font-bold text-cyan-300">{apiTraceDetails[selectedApiKey].endpoint}</p>
                <p className="text-[10px] text-slate-400">{apiTraceDetails[selectedApiKey].controller}</p>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">Request DTO & Validation</span>
                <p className="text-xs font-mono text-amber-300">{apiTraceDetails[selectedApiKey].requestDto}</p>
                <p className="text-[10px] text-slate-400">{apiTraceDetails[selectedApiKey].validation}</p>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">Service & Database</span>
                <p className="text-xs font-mono text-rose-300">{apiTraceDetails[selectedApiKey].service}</p>
                <p className="text-[10px] text-slate-400">{apiTraceDetails[selectedApiKey].database}</p>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">Response Status</span>
                <p className="text-xs font-mono font-bold text-emerald-300">{apiTraceDetails[selectedApiKey].response}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Event Trace Mode */}
      {activeMode === 'event' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">TRACE EVENT MODE</h3>
            </div>
            <select
              value={selectedEventKey}
              onChange={(e) => setSelectedEventKey(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-purple-300 font-mono text-xs rounded-xl px-3 py-1.5 focus:outline-none"
            >
              {Object.keys(eventTraceDetails).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>

          {eventTraceDetails[selectedEventKey] && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">Producer & Event</span>
                <p className="text-xs font-mono font-bold text-purple-300">{eventTraceDetails[selectedEventKey].eventName}</p>
                <p className="text-[10px] text-slate-400">{eventTraceDetails[selectedEventKey].producer}</p>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">Broker & Outbox Table</span>
                <p className="text-xs font-mono text-cyan-300">{eventTraceDetails[selectedEventKey].broker}</p>
                <p className="text-[10px] text-slate-400">Table: {eventTraceDetails[selectedEventKey].outboxTable}</p>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">Consumers</span>
                <div className="space-y-0.5 font-mono text-[10px] text-emerald-300">
                  {eventTraceDetails[selectedEventKey].consumers.map((c, i) => (
                    <p key={i}>• {c}</p>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">Idempotency & Failure Recovery</span>
                <p className="text-xs text-slate-300">{eventTraceDetails[selectedEventKey].idempotencyStrategy}</p>
                <p className="text-[10px] text-slate-400">{eventTraceDetails[selectedEventKey].failureRecovery}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
