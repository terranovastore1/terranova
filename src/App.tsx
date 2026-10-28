import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { PricelistPage } from './pages/PricelistPage';
import { AdminPage } from './pages/AdminPage';

const RouteScrollManager: React.FC = () => {
  const location = useLocation();
  const { setSidebarOpen } = useStore();

  useEffect(() => {
    setSidebarOpen(false);
    document.body.style.overflow = '';

    const isHome = location.pathname === '/';
    document.body.classList.toggle('page-home', isHome);

    if (location.hash) {
      const targetId = location.hash.replace('#', '');
      const timer = window.setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          const navbar = document.getElementById('navbar');
          const offset = (navbar ? navbar.offsetHeight : 76) + 16;
          const top = el.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        }
      }, 120);
      return () => window.clearTimeout(timer);
    }

    window.scrollTo({ top: 0, behavior: 'auto' });
    return undefined;
  }, [location.pathname, location.hash, setSidebarOpen]);

  return null;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <StoreProvider>
        <RouteScrollManager />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/index.html" element={<Navigate to="/" replace />} />

          <Route path="/streaming" element={<CategoryPage category="streaming" />} />
          <Route path="/streaming.html" element={<Navigate to="/streaming" replace />} />

          <Route path="/editing" element={<CategoryPage category="editing" />} />
          <Route path="/editing.html" element={<Navigate to="/editing" replace />} />

          <Route path="/listening" element={<CategoryPage category="listening" />} />
          <Route path="/listening.html" element={<Navigate to="/listening" replace />} />

          <Route path="/study" element={<CategoryPage category="study" />} />
          <Route path="/study.html" element={<Navigate to="/study" replace />} />

          <Route path="/lainnya" element={<CategoryPage category="lainnya" />} />
          <Route path="/lainnya.html" element={<Navigate to="/lainnya" replace />} />

          <Route path="/topup" element={<CategoryPage category="topup" />} />
          <Route path="/topup.html" element={<Navigate to="/topup" replace />} />

          <Route path="/pricelist" element={<PricelistPage />} />
          <Route path="/pricelist.html" element={<Navigate to="/pricelist" replace />} />

          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin.html" element={<Navigate to="/admin" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </StoreProvider>
    </BrowserRouter>
  );
};

export default App;
