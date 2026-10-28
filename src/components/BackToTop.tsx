import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const getThreshold = () => {
      const hero = document.querySelector('.hero');
      if (hero) {
        const rect = hero.getBoundingClientRect();
        const heroBottom = rect.bottom + window.scrollY;
        return Math.max(300, heroBottom - 180);
      }
      return 220;
    };

    let threshold = getThreshold();
    let ticking = false;

    const onResize = () => {
      threshold = getThreshold();
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setVisible(window.scrollY > threshold);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
    };
  }, [location.pathname]);

  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <button
      id="backToTopBtn"
      type="button"
      className={`back-to-top ${visible ? 'visible' : ''}`}
      aria-label="Kembali ke navigasi atas"
      title="Kembali ke atas"
      onClick={scrollToTop}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="12" y1="19" x2="12" y2="5" />
        <polyline points="5 12 12 5 19 12" />
      </svg>
    </button>
  );
};
