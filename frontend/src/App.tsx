import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { SearchPage } from './pages/SearchPage';
import { ProductDetails } from './pages/ProductDetails';
import { CartPage } from './pages/CartPage';
import { OrdersPage } from './pages/OrdersPage';
import { FlashSaleDashboard } from './pages/FlashSaleDashboard';
import { HldVisualizerApp } from './hld/components/HldVisualizerApp';
import { LldVisualizerApp } from './lld/components/LldVisualizerApp';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-rose-500 selection:text-white">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/admin/flash-sale" element={<FlashSaleDashboard />} />
            <Route path="/hld" element={<HldVisualizerApp />} />
            <Route path="/architecture/hld" element={<HldVisualizerApp />} />
            <Route path="/lld" element={<LldVisualizerApp />} />
            <Route path="/architecture/lld" element={<LldVisualizerApp />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
