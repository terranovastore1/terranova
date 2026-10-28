import React, { useCallback, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export function scrollToElementWithOffset(selector: string): void {
  const el = document.querySelector(selector);
  if (!el) return;
  const navbar = document.getElementById('navbar');
  const offset = (navbar ? navbar.offsetHeight : 76) + 16;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targetTop = el.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({
    top: Math.max(0, targetTop),
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
  });
}

interface SidebarNavItem {
  to: string;
  emoji: string;
  label: string;
  matchKey: string;
  isContact?: boolean;
}

const SIDEBAR_ITEMS: SidebarNavItem[] = [
  { to: '/', emoji: '🏠', label: 'BERANDA', matchKey: '/' },
  { to: '/streaming', emoji: '📺', label: 'APK STREAMING', matchKey: '/streaming' },
  { to: '/editing', emoji: '🎬', label: 'APK EDITING', matchKey: '/editing' },
  { to: '/listening', emoji: '🎵', label: 'APK LISTENING', matchKey: '/listening' },
  { to: '/study', emoji: '📚', label: 'APK STUDY', matchKey: '/study' },
  { to: '/lainnya', emoji: '📦', label: 'APK LAINNYA', matchKey: '/lainnya' },
  { to: '/topup', emoji: '🎮', label: 'TOP UP GAME', matchKey: '/topup' },
  { to: '/pricelist', emoji: '💰', label: 'PRICELIST APK', matchKey: '/pricelist' },
  { to: '/#quick-contact', emoji: '💬', label: 'HUBUNGI KAMI', matchKey: 'quick-contact', isContact: true },
];

export const StoreHeader: React.FC = () => {
  const { sidebarOpen, setSidebarOpen } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, [setSidebarOpen]);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else if (!document.body.classList.contains('intro-active')) {
      document.body.style.overflow = '';
    }
  }, [sidebarOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) {
        closeSidebar();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [sidebarOpen, closeSidebar]);

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    closeSidebar();
    if (location.pathname === '/' || location.pathname === '/index.html') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      try {
        sessionStorage.setItem('terranova_navigated_back', 'true');
      } catch {
        // Ignore storage errors
      }
    }
  };

  const handleContactClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    closeSidebar();
    if (location.pathname === '/' || location.pathname === '/index.html') {
      scrollToElementWithOffset('#quick-contact');
    } else {
      try {
        sessionStorage.setItem('terranova_navigated_back', 'true');
      } catch {
        // Ignore storage errors
      }
      navigate('/#quick-contact');
    }
  };

  const isPathActive = (item: SidebarNavItem): boolean => {
    const path = location.pathname.replace(/\.html$/i, '') || '/';
    if (item.isContact) {
      return location.hash === '#quick-contact';
    }
    if (item.matchKey === '/') {
      return (path === '/' || path === '/index') && location.hash !== '#quick-contact';
    }
    return path === item.matchKey;
  };

  return (
    <>
      <div
        className={`overlay ${sidebarOpen ? 'active' : ''}`}
        id="overlay"
        onClick={closeSidebar}
      />

      <aside className={`sidebar ${sidebarOpen ? 'active' : ''}`} id="sidebar">
        <div className="sidebar-top">
          <span className="sidebar-logo">
            TERRANOVA <span>STORE</span>
          </span>
          <button
            className="sidebar-close"
            id="sidebarClose"
            type="button"
            aria-label="Tutup menu"
            onClick={closeSidebar}
          >
            &times;
          </button>
        </div>
        <nav className="sidebar-nav">
          {SIDEBAR_ITEMS.map((item) => {
            const active = isPathActive(item);
            if (item.isContact) {
              return (
                <a
                  key={item.to}
                  href="/#quick-contact"
                  className={`sidebar-link ${active ? 'active' : ''}`}
                  onClick={handleContactClick}
                >
                  <span className="ui-emoji" aria-hidden="true">
                    {item.emoji}
                  </span>
                  <span>{item.label}</span>
                </a>
              );
            }
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`sidebar-link ${active ? 'active' : ''}`}
                onClick={item.matchKey === '/' ? handleHomeClick : closeSidebar}
              >
                <span className="ui-emoji" aria-hidden="true">
                  {item.emoji}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <header className="navbar" id="navbar">
        <div className="navbar-inner">
          <Link to="/" className="brand" onClick={handleHomeClick}>
            <span className="brand-logo-wrap">
              <img
                src="/assets/images/logo-kucing-poster.webp"
                alt="Terranova Logo"
                className="brand-logo-media"
                loading="eager"
                decoding="async"
                referrerPolicy="no-referrer"
              />
            </span>
            <span className="brand-text">
              TERRANOVA<span className="brand-store"> STORE</span>
            </span>
          </Link>

          <nav className="nav-menu" id="navMenu">
            <Link to="/" onClick={handleHomeClick}>
              BERANDA
            </Link>
            <Link to="/streaming">APK STREAMING</Link>
            <Link to="/editing">APK EDITING</Link>
            <Link to="/listening">APK LISTENING</Link>
            <Link to="/study">APK STUDY</Link>
            <Link to="/lainnya">APK LAINNYA</Link>
            <Link to="/topup">TOP UP GAME</Link>
            <Link to="/pricelist">PRICELIST</Link>
            <a href="/#quick-contact" onClick={handleContactClick}>
              HUBUNGI KAMI
            </a>
          </nav>

          <div className="navbar-actions">
            <Link
              to="/admin"
              className="nav-admin-btn"
              title="Portal Admin"
              aria-label="Portal Admin"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Admin</span>
            </Link>

            <button
              type="button"
              className={`hamburger ${sidebarOpen ? 'active' : ''}`}
              id="hamburgerBtn"
              aria-label="Buka menu"
              onClick={() => setSidebarOpen((prev) => !prev)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
