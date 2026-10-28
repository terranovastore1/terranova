import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { ProductCategory } from '../types/product';
import {
  CATEGORIES,
  CATEGORY_MAP,
  STORE_CONFIG,
  buildWhatsAppLink,
} from '../constants/storeConfig';
import { useStore } from '../context/StoreContext';
import { StoreLayout } from '../components/StoreLayout';
import { IntroAnimation } from '../components/IntroAnimation';
import { ProductCard } from '../components/ProductCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { scrollToElementWithOffset } from '../components/StoreHeader';

const FILTER_PILLS: Array<{ key: 'all' | ProductCategory; label: string }> = [
  { key: 'all', label: 'Semua' },
  { key: 'streaming', label: '📺 Streaming' },
  { key: 'editing', label: '🎬 Editing' },
  { key: 'listening', label: '🎵 Listening' },
  { key: 'study', label: '📚 Study' },
  { key: 'lainnya', label: '📦 Lainnya' },
  { key: 'topup', label: '🎮 Top Up' },
];

export const HomePage: React.FC = () => {
  const { products } = useStore();
  const location = useLocation();

  const [rawQuery, setRawQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<'all' | ProductCategory>('all');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const categoryGridRef = useRef<HTMLDivElement | null>(null);
  const quickContactRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    document.title = 'Terranova Store';
    document.body.classList.add('page-home');
    return () => {
      document.body.classList.remove('page-home');
    };
  }, []);

  // Handle hash scrolling (/#quick-contact or /#kategori)
  useEffect(() => {
    if (location.hash) {
      const timer = window.setTimeout(() => {
        scrollToElementWithOffset(location.hash);
      }, 150);
      return () => window.clearTimeout(timer);
    }
  }, [location.hash]);

  // Debounce search & category filter with 180ms skeleton shimmer
  useEffect(() => {
    const trimmed = rawQuery.trim().toLowerCase();
    if (trimmed === '' && activeCategory === 'all') {
      setIsSearching(false);
      setDebouncedQuery('');
      return;
    }

    setIsSearching(true);
    const timer = window.setTimeout(() => {
      setDebouncedQuery(trimmed);
      setIsSearching(false);
    }, 180);

    return () => window.clearTimeout(timer);
  }, [rawQuery, activeCategory]);

  // Staggered IntersectionObserver reveal for category cards & quick contact cards
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const categoryCards = categoryGridRef.current
      ? Array.from(categoryGridRef.current.querySelectorAll<HTMLElement>('.category-card'))
      : [];
    const quickCards = quickContactRef.current
      ? Array.from(quickContactRef.current.querySelectorAll<HTMLElement>('.quick-card'))
      : [];

    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
      categoryCards.forEach((c) => c.classList.add('reveal', 'in-view'));
      quickCards.forEach((c) => c.classList.add('reveal', 'in-view'));
      return;
    }

    const catObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const card = entry.target as HTMLElement;
            const index = categoryCards.indexOf(card);
            const delay = Math.max(0, index) * 75;
            card.style.transitionDelay = `${delay}ms`;
            card.classList.add('in-view');
            catObserver.unobserve(card);

            window.setTimeout(() => {
              card.style.transitionDelay = '';
            }, delay + 680);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    categoryCards.forEach((card) => {
      card.classList.add('reveal', 'category-reveal');
      catObserver.observe(card);
    });

    const quickObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            quickObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    quickCards.forEach((card) => {
      card.classList.add('reveal');
      quickObserver.observe(card);
    });

    return () => {
      catObserver.disconnect();
      quickObserver.disconnect();
    };
  }, []);

  const activeProducts = useMemo(
    () => products.filter((p) => p.active !== false),
    [products]
  );

  const filteredProducts = useMemo(() => {
    return activeProducts.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }
      if (debouncedQuery === '') return true;

      const nameMatch = item.name.toLowerCase().includes(debouncedQuery);
      const descMatch = item.description.toLowerCase().includes(debouncedQuery);
      const catLabel = (CATEGORY_MAP[item.category]?.label || '').toLowerCase();
      const catMatch = catLabel.includes(debouncedQuery);
      const packageMatch = Array.isArray(item.packages)
        ? item.packages.some((pkg) => pkg.label.toLowerCase().includes(debouncedQuery))
        : false;

      return nameMatch || descMatch || catMatch || packageMatch;
    });
  }, [activeProducts, activeCategory, debouncedQuery]);

  const showLiveResults = rawQuery.trim() !== '' || activeCategory !== 'all';

  const resultsTitle = useMemo(() => {
    const trimmedRaw = rawQuery.trim();
    const catLabel =
      activeCategory !== 'all'
        ? CATEGORY_MAP[activeCategory]?.label || activeCategory
        : '';
    if (trimmedRaw && activeCategory !== 'all') {
      return `Pencarian "${trimmedRaw}" di ${catLabel}`;
    }
    if (trimmedRaw) {
      return `Hasil Pencarian: "${trimmedRaw}"`;
    }
    return `Katalog: ${catLabel}`;
  }, [rawQuery, activeCategory]);

  const generalWaLink = buildWhatsAppLink(
    'Halo Kak Admin Terranova Store! Mau tanya-tanya produk dan pricelist terbarunya ya kak, terima kasih!'
  );

  const requestWaLink = buildWhatsAppLink(
    `Halo Kak Admin Terranova Store! Mau tanya untuk produk ${
      rawQuery.trim() || activeCategory
    } ready kah? Mau order nih kak, terima kasih!`
  );

  const handleClearSearch = () => {
    setRawQuery('');
    setDebouncedQuery('');
    setIsSearching(false);
    searchInputRef.current?.focus();
  };

  return (
    <StoreLayout>
      <IntroAnimation />

      {/* ===================== HERO ===================== */}
      <section className="hero" id="home">
        <div className="hero-glow" />
        <div className="hero-decor" aria-hidden="true">
          <span className="decor decor-diamond">💎</span>
          <span className="decor decor-rocket">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 64 64"
              width="52"
              height="52"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="hrkt-body" x1="0%" y1="0%" x2="100%" y2="80%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="30%" stopColor="#e8f1fc" />
                  <stop offset="70%" stopColor="#bacfe8" />
                  <stop offset="100%" stopColor="#8baad4" />
                </linearGradient>
                <linearGradient id="hrkt-nose" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff3b69" />
                  <stop offset="60%" stopColor="#e01044" />
                  <stop offset="100%" stopColor="#910025" />
                </linearGradient>
                <linearGradient id="hrkt-wing-l" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff4d79" />
                  <stop offset="100%" stopColor="#ba0d3b" />
                </linearGradient>
                <linearGradient id="hrkt-wing-r" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d61845" />
                  <stop offset="100%" stopColor="#69001b" />
                </linearGradient>
                <radialGradient id="hrkt-window" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#d4fbff" />
                  <stop offset="40%" stopColor="#00d4ff" />
                  <stop offset="85%" stopColor="#0066aa" />
                  <stop offset="100%" stopColor="#003159" />
                </radialGradient>
                <linearGradient id="hrkt-flame-out" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ff0055" />
                  <stop offset="40%" stopColor="#ff6a00" />
                  <stop offset="85%" stopColor="#ffca00" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="hrkt-flame-in" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="35%" stopColor="#c2f9ff" />
                  <stop offset="70%" stopColor="#00e1ff" />
                  <stop offset="100%" stopColor="#ffdd00" />
                </linearGradient>
                <linearGradient id="hrkt-nozzle" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2d3345" />
                  <stop offset="50%" stopColor="#4d5773" />
                  <stop offset="100%" stopColor="#1f2330" />
                </linearGradient>
              </defs>
              <g transform="rotate(45 32 32)">
                <path
                  d="M27.5 45 C25 50, 23 54, 26 58 C28 60, 30 63, 32 64 C34 63, 36 60, 38 58 C41 54, 39 50, 36.5 45 Z"
                  fill="url(#hrkt-flame-out)"
                  opacity="0.95"
                />
                <path
                  d="M29 45 C28 48, 28.5 52, 30.5 55 C31.2 56, 32 58, 32 58 C32 58, 32.8 56, 33.5 55 C35.5 52, 36 48, 35 45 Z"
                  fill="url(#hrkt-flame-in)"
                />
                <circle cx="28" cy="61" r="0.9" fill="#ffea00" opacity="0.8" />
                <circle cx="36" cy="62" r="1.1" fill="#ffea00" opacity="0.8" />
                <circle cx="32" cy="66" r="0.7" fill="#ffffff" opacity="0.9" />
                <path
                  d="M24 33 C21 34, 15 41, 14 47 C17 46.5, 22 45, 25 43 Z"
                  fill="url(#hrkt-wing-l)"
                />
                <path d="M24 33 L14 47 L17 47 Z" fill="#ffffff" opacity="0.25" />
                <path
                  d="M40 33 C43 34, 49 41, 50 47 C47 46.5, 42 45, 39 43 Z"
                  fill="url(#hrkt-wing-r)"
                />
                <path d="M27 43 L37 43 L35.5 46.5 L28.5 46.5 Z" fill="url(#hrkt-nozzle)" />
                <ellipse cx="32" cy="46.5" rx="3.5" ry="1" fill="#141721" />
                <path
                  d="M32 6 C28 14, 23.5 24, 24 43.5 C26.5 44.5, 37.5 44.5, 40 43.5 C40.5 24, 36 14, 32 6 Z"
                  fill="url(#hrkt-body)"
                />
                <path
                  d="M32 7 C29.5 13, 26 23, 26 41 C25 39, 25 24, 28 14 Z"
                  fill="#ffffff"
                  opacity="0.45"
                />
                <line
                  x1="32"
                  y1="18"
                  x2="32"
                  y2="43.5"
                  stroke="#ffffff"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                  opacity="0.3"
                />
                <path
                  d="M32 6 C30.5 9.5, 28.5 14, 27.5 18 C30.5 19, 33.5 19, 36.5 18 C35.5 14, 33.5 9.5, 32 6 Z"
                  fill="url(#hrkt-nose)"
                />
                <path
                  d="M32 6 C31 9.5, 29.5 13.5, 29 16 C30 16.5, 31 16.5, 32 16.5 Z"
                  fill="#ffffff"
                  opacity="0.35"
                />
                <polygon points="31.3,34 32.7,34 32.4,44 31.6,44" fill="#9dbadc" opacity="0.6" />
                <circle cx="32" cy="26" r="4.8" fill="#2d3345" stroke="#71829e" strokeWidth="0.7" />
                <circle cx="32" cy="26" r="3.8" fill="url(#hrkt-window)" />
                <path
                  d="M30 23.5 A 2.6 2.6 0 0 1 34 24.5 A 3.2 3.2 0 0 0 30.5 27 Z"
                  fill="#ffffff"
                  opacity="0.75"
                />
                <path
                  d="M25 38.5 C29 39.5, 35 39.5, 39 38.5 L39.3 40 C35.3 41, 28.7 41, 24.7 40 Z"
                  fill="#ff2a6d"
                  opacity="0.85"
                />
              </g>
            </svg>
          </span>
          <span className="decor decor-star-a">⭐</span>
          <span className="decor decor-star-b">✨</span>
          <span className="decor decor-planet">🪐</span>
          <span className="decor decor-comet">☄️</span>
          <span className="decor decor-galaxy">🌌</span>
          <span className="decor decor-star-c">🌟</span>
          <span className="decor decor-ufo">🛸</span>
          <span className="decor decor-star-d">✦</span>
          <span className="decor decor-star-e">✦</span>
          <span className="decor decor-star-f">✦</span>
          <span className="decor decor-moon-full">🌕</span>
          <span className="decor decor-moon-dark">🌑</span>
        </div>

        <div className="hero-content">
          <div className="hero-logo-wrap">
            <img
              src="/assets/images/logo-kucing-poster.webp"
              alt="Terranova Profile"
              className="hero-logo-media"
              loading="eager"
              decoding="async"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="hero-title">
            TERRANOVA <span>STORE</span>
          </h1>
          <p className="hero-slogan">Premium Apps &amp; Top Up Game</p>
          <div className="hero-actions">
            <a
              href="#kategori"
              className="btn btn-primary"
              onClick={(e) => {
                e.preventDefault();
                scrollToElementWithOffset('#kategori');
              }}
            >
              <span className="ui-emoji" aria-hidden="true">
                🛒
              </span>
              <span>Lihat Katalog</span>
            </a>
          </div>
        </div>
      </section>

      {/* ===================== KONTAK SINGKAT ===================== */}
      <section className="quick-contact" id="quick-contact" ref={quickContactRef}>
        <a
          className="quick-card"
          id="quickWhatsapp"
          href={generalWaLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="quick-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#25D366"
                d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"
              />
            </svg>
          </span>
          <div className="quick-title-row">
            <span className="quick-title">WHATSAPP</span>
            <span
              className="online-indicator-wrap"
              tabIndex={0}
              role="status"
              aria-label="Status: Online. Fast response time, respon cepat."
            >
              <span className="online-dot-container">
                <span className="online-dot-pulse" />
                <span className="online-dot" />
              </span>
              <span className="online-label">Online</span>
              <span className="online-tooltip" role="tooltip">
                <span className="tooltip-badge">⚡ Fast Response</span>
                <span className="tooltip-text">
                  Admin aktif &amp; fast response (balas &lt; 5 mnt)
                </span>
              </span>
            </span>
          </div>
          <span className="quick-desc">Chat dengan kami!</span>
          <span className="quick-cta">Hubungi kami &rarr;</span>
        </a>

        <a
          className="quick-card"
          id="quickInstagram"
          href={STORE_CONFIG.instagram}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="quick-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              width="48"
              height="48"
              aria-hidden="true"
            >
              <radialGradient
                id="ig-grad1"
                cx="19.379"
                cy="42.035"
                r="44.899"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" stopColor="#fd5" />
                <stop offset=".328" stopColor="#ff543f" />
                <stop offset=".348" stopColor="#fc5245" />
                <stop offset=".504" stopColor="#e64771" />
                <stop offset=".643" stopColor="#d53e91" />
                <stop offset=".761" stopColor="#cc39a4" />
                <stop offset=".841" stopColor="#c837ab" />
              </radialGradient>
              <path
                fill="url(#ig-grad1)"
                d="M34.017 41.99l-20 .019c-4.4.004-8.003-3.592-8.008-7.992l-.019-20c-.004-4.4 3.592-8.003 7.992-8.008l20-.019c4.4-.004 8.003 3.592 8.008 7.992l.019 20c.005 4.401-3.592 8.004-7.992 8.008z"
              />
              <radialGradient
                id="ig-grad2"
                cx="11.786"
                cy="5.54"
                r="29.813"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" stopColor="#4168c9" />
                <stop offset=".999" stopColor="#4168c9" stopOpacity="0" />
              </radialGradient>
              <path
                fill="url(#ig-grad2)"
                d="M34.017 41.99l-20 .019c-4.4.004-8.003-3.592-8.008-7.992l-.019-20c-.004-4.4 3.592-8.003 7.992-8.008l20-.019c4.4-.004 8.003 3.592 8.008 7.992l.019 20c.005 4.401-3.592 8.004-7.992 8.008z"
              />
              <path
                fill="#fff"
                d="M24 31c-3.859 0-7-3.14-7-7s3.141-7 7-7 7 3.14 7 7-3.141 7-7 7zm0-12c-2.757 0-5 2.243-5 5s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5z"
              />
              <circle cx="31.5" cy="16.5" r="1.5" fill="#fff" />
              <path
                fill="#fff"
                d="M30 37H18c-3.859 0-7-3.14-7-7V18c0-3.86 3.141-7 7-7h12c3.859 0 7 3.14 7 7v12c0 3.86-3.141 7-7 7zM18 13c-2.757 0-5 2.243-5 5v12c0 2.757 2.243 5 5 5h12c2.757 0 5-2.243 5-5V18c0-2.757-2.243-5-5-5H18z"
              />
            </svg>
          </span>
          <span className="quick-title">INSTAGRAM</span>
          <span className="quick-desc">Follow kami!</span>
          <span className="quick-cta">Kunjungi &rarr;</span>
        </a>

        <a
          className="quick-card"
          id="quickTiktok"
          href={STORE_CONFIG.tiktok}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="quick-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 28 28" aria-hidden="true">
              <path
                fill="#25f4ee"
                transform="translate(-0.7,0)"
                d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
              />
              <path
                fill="#fe2c55"
                transform="translate(0.7,0)"
                d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
              />
              <path
                fill="#fff"
                d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
              />
            </svg>
          </span>
          <span className="quick-title">TIKTOK</span>
          <span className="quick-desc">Follow kami!</span>
          <span className="quick-cta">Kunjungi &rarr;</span>
        </a>
      </section>

      {/* ===================== NOTE ===================== */}
      <section className="note-section">
        <div className="note-box">
          <span className="note-label">
            <span className="ui-emoji" aria-hidden="true">
              📌
            </span>
            <span>NOTE</span>
          </span>
          <p>
            Produk dan layanan tersedia sesuai syarat dan ketentuan yang berlaku. Harga dapat
            berubah sewaktu-waktu, silakan konfirmasi harga terbaru melalui WhatsApp sebelum
            melakukan order.
          </p>
        </div>
      </section>

      {/* ===================== KATEGORI & PENCARIAN REAL-TIME ===================== */}
      <section className="categories" id="kategori">
        <div className="search-filter-wrapper">
          <div className="search-bar-box">
            <span className="search-bar-icon" aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              ref={searchInputRef}
              type="text"
              id="productSearchInput"
              className="search-input"
              placeholder="Cari aplikasi atau game (mis. Netflix, Canva, Spotify, MLBB)..."
              autoComplete="off"
              aria-label="Cari aplikasi atau game"
              value={rawQuery}
              onChange={(e) => setRawQuery(e.target.value)}
            />
            {rawQuery.trim().length > 0 && (
              <button
                type="button"
                id="searchClearBtn"
                className="search-clear-btn"
                aria-label="Hapus pencarian"
                onClick={handleClearSearch}
              >
                &times;
              </button>
            )}
          </div>

          <div
            className="quick-filter-pills"
            id="categoryFilterPills"
            role="tablist"
            aria-label="Filter kategori"
          >
            {FILTER_PILLS.map((pill) => (
              <button
                key={pill.key}
                type="button"
                className={`filter-pill ${activeCategory === pill.key ? 'active' : ''}`}
                data-category={pill.key}
                onClick={() => setActiveCategory(pill.key)}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* Real-Time Search Results Grid */}
        {showLiveResults && (
          <div className="live-search-results" id="liveSearchResults">
            <div className="search-results-header">
              <h3 className="search-results-title" id="searchResultsTitle">
                {resultsTitle}
              </h3>
              <span className="search-results-count" id="searchResultsCount">
                {isSearching ? 'Mencari...' : `${filteredProducts.length} produk ditemukan`}
              </span>
            </div>

            {isSearching ? (
              <div className="product-grid" id="searchProductGrid">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="product-grid" id="searchProductGrid">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} showCategoryTag />
                ))}
              </div>
            ) : (
              <div className="search-empty-state" id="searchEmptyState">
                <div className="empty-icon" aria-hidden="true">
                  🔍
                </div>
                <h4 className="empty-title">Produk Tidak Ditemukan</h4>
                <p className="empty-desc" id="searchEmptyDesc">
                  {rawQuery.trim()
                    ? `Tidak ada aplikasi atau game yang cocok dengan "${rawQuery.trim()}". Mau pesan atau request khusus?`
                    : 'Belum ada produk di kategori ini.'}
                </p>
                <a
                  href={requestWaLink}
                  id="searchRequestBtn"
                  className="btn btn-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="ui-emoji" aria-hidden="true">
                    💬
                  </span>
                  <span>Tanya / Request ke Admin WhatsApp</span>
                </a>
              </div>
            )}
          </div>
        )}

        {/* Kategori Default */}
        <div
          className="default-category-view"
          id="defaultCategoryView"
          style={{ display: showLiveResults ? 'none' : 'block' }}
        >
          <h2 className="section-title">
            <span className="title-rocket-wrap" aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 64 64"
                width="36"
                height="36"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="crkt-body" x1="0%" y1="0%" x2="100%" y2="80%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="30%" stopColor="#e8f1fc" />
                    <stop offset="70%" stopColor="#bacfe8" />
                    <stop offset="100%" stopColor="#8baad4" />
                  </linearGradient>
                  <linearGradient id="crkt-nose" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff3b69" />
                    <stop offset="60%" stopColor="#e01044" />
                    <stop offset="100%" stopColor="#910025" />
                  </linearGradient>
                  <linearGradient id="crkt-wing-l" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff4d79" />
                    <stop offset="100%" stopColor="#ba0d3b" />
                  </linearGradient>
                  <linearGradient id="crkt-wing-r" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#d61845" />
                    <stop offset="100%" stopColor="#69001b" />
                  </linearGradient>
                  <radialGradient id="crkt-window" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#d4fbff" />
                    <stop offset="40%" stopColor="#00d4ff" />
                    <stop offset="85%" stopColor="#0066aa" />
                    <stop offset="100%" stopColor="#003159" />
                  </radialGradient>
                  <linearGradient id="crkt-flame-out" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ff0055" />
                    <stop offset="40%" stopColor="#ff6a00" />
                    <stop offset="85%" stopColor="#ffca00" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.8" />
                  </linearGradient>
                  <linearGradient id="crkt-flame-in" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="35%" stopColor="#c2f9ff" />
                    <stop offset="70%" stopColor="#00e1ff" />
                    <stop offset="100%" stopColor="#ffdd00" />
                  </linearGradient>
                  <linearGradient id="crkt-nozzle" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2d3345" />
                    <stop offset="50%" stopColor="#4d5773" />
                    <stop offset="100%" stopColor="#1f2330" />
                  </linearGradient>
                </defs>
                <g transform="rotate(45 32 32)">
                  <path
                    d="M27.5 45 C25 50, 23 54, 26 58 C28 60, 30 63, 32 64 C34 63, 36 60, 38 58 C41 54, 39 50, 36.5 45 Z"
                    fill="url(#crkt-flame-out)"
                    opacity="0.95"
                  />
                  <path
                    d="M29 45 C28 48, 28.5 52, 30.5 55 C31.2 56, 32 58, 32 58 C32 58, 32.8 56, 33.5 55 C35.5 52, 36 48, 35 45 Z"
                    fill="url(#crkt-flame-in)"
                  />
                  <circle cx="28" cy="61" r="0.9" fill="#ffea00" opacity="0.8" />
                  <circle cx="36" cy="62" r="1.1" fill="#ffea00" opacity="0.8" />
                  <path
                    d="M24 33 C21 34, 15 41, 14 47 C17 46.5, 22 45, 25 43 Z"
                    fill="url(#crkt-wing-l)"
                  />
                  <path d="M24 33 L14 47 L17 47 Z" fill="#ffffff" opacity="0.25" />
                  <path
                    d="M40 33 C43 34, 49 41, 50 47 C47 46.5, 42 45, 39 43 Z"
                    fill="url(#crkt-wing-r)"
                  />
                  <path d="M27 43 L37 43 L35.5 46.5 L28.5 46.5 Z" fill="url(#crkt-nozzle)" />
                  <ellipse cx="32" cy="46.5" rx="3.5" ry="1" fill="#141721" />
                  <path
                    d="M32 6 C28 14, 23.5 24, 24 43.5 C26.5 44.5, 37.5 44.5, 40 43.5 C40.5 24, 36 14, 32 6 Z"
                    fill="url(#crkt-body)"
                  />
                  <path
                    d="M32 7 C29.5 13, 26 23, 26 41 C25 39, 25 24, 28 14 Z"
                    fill="#ffffff"
                    opacity="0.45"
                  />
                  <line
                    x1="32"
                    y1="18"
                    x2="32"
                    y2="43.5"
                    stroke="#ffffff"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                    opacity="0.3"
                  />
                  <path
                    d="M32 6 C30.5 9.5, 28.5 14, 27.5 18 C30.5 19, 33.5 19, 36.5 18 C35.5 14, 33.5 9.5, 32 6 Z"
                    fill="url(#crkt-nose)"
                  />
                  <polygon points="31.3,34 32.7,34 32.4,44 31.6,44" fill="#9dbadc" opacity="0.6" />
                  <circle cx="32" cy="26" r="4.8" fill="#2d3345" stroke="#71829e" strokeWidth="0.7" />
                  <circle cx="32" cy="26" r="3.8" fill="url(#crkt-window)" />
                  <path
                    d="M30 23.5 A 2.6 2.6 0 0 1 34 24.5 A 3.2 3.2 0 0 0 30.5 27 Z"
                    fill="#ffffff"
                    opacity="0.75"
                  />
                  <path
                    d="M25 38.5 C29 39.5, 35 39.5, 39 38.5 L39.3 40 C35.3 41, 28.7 41, 24.7 40 Z"
                    fill="#ff2a6d"
                    opacity="0.85"
                  />
                </g>
              </svg>
            </span>
            Kategori Produk
          </h2>
          <p className="section-subtitle">Pilih kategori yang kamu butuhkan</p>

          <div className="category-grid" ref={categoryGridRef}>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.key}
                to={cat.path}
                className={`category-card ${cat.categoryCardAccent}`}
              >
                <span className="category-icon" aria-hidden="true">
                  {cat.emoji}
                </span>
                <span className="category-name">{cat.categoryCardName}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </StoreLayout>
  );
};
