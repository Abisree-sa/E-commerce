import React from 'react';
import { Zap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-rose-600 text-white">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <span className="text-lg font-black tracking-wider text-white">
            SALE<span className="text-rose-500">STORM</span>
          </span>
        </div>

        <div className="text-xs text-slate-500 text-center md:text-right">
          Production-grade E-Commerce Flash Sale Architecture Prototype. Built with Java 21, Spring Boot, PostgreSQL, OpenSearch, Kafka, Redis, and React.
        </div>
      </div>
    </footer>
  );
};
