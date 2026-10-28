import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { generateStarShadow } from './GalaxyBackground';

const INTRO_HOLD_MS = 6600;
const INTRO_FADE_MS = 750;

const WORD_TERRANOVA = ['T', 'E', 'R', 'R', 'A', 'N', 'O', 'V', 'A'];
const WORD_STORE = ['S', 'T', 'O', 'R', 'E'];

export const IntroAnimation: React.FC = () => {
  const [shouldRender, setShouldRender] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      sessionStorage.removeItem('terranova_intro_seen');
      const isNavigatedBack = sessionStorage.getItem('terranova_navigated_back') === 'true';
      if (isNavigatedBack) {
        sessionStorage.removeItem('terranova_navigated_back');
        return false;
      }
    } catch {
      // Ignore sessionStorage errors
    }
    return true;
  });

  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const endedRef = useRef<boolean>(false);
  const fadeTimerRef = useRef<number | null>(null);

  const spaceLayers = useMemo(() => {
    if (!shouldRender || typeof window === 'undefined') return null;
    const isMobileScreen = window.innerWidth <= 768;

    const w = Math.max(window.innerWidth, 360);
    const smallCount = isMobileScreen ? 65 : 95;
    const cosmosCount = isMobileScreen ? 50 : 75;

    const introStars = generateStarShadow(
      smallCount,
      w,
      2000,
      () => `rgba(255,255,255,${(0.45 + Math.random() * 0.45).toFixed(2)})`
    );
    const cosmosStars = generateStarShadow(
      cosmosCount,
      w,
      1400,
      () => `rgba(34,211,238,${(0.55 + Math.random() * 0.45).toFixed(2)}) 0 0 1px`
    );
    return { introStars, cosmosStars };
  }, [shouldRender]);

  const endIntro = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;

    setIsFadingOut(true);
    document.body.style.overflow = '';
    document.body.classList.remove('intro-active');

    fadeTimerRef.current = window.setTimeout(() => {
      setShouldRender(false);
    }, INTRO_FADE_MS);
  }, []);

  useEffect(() => {
    if (!shouldRender) return;

    document.body.style.overflow = 'hidden';
    document.body.classList.add('intro-active');

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        endIntro();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    const holdTimer = window.setTimeout(endIntro, INTRO_HOLD_MS);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.clearTimeout(holdTimer);
      if (fadeTimerRef.current) {
        window.clearTimeout(fadeTimerRef.current);
      }
      document.body.style.overflow = '';
      document.body.classList.remove('intro-active');
    };
  }, [shouldRender, endIntro]);

  if (!shouldRender) return null;

  return (
    <div
      className={`intro ${isFadingOut ? 'intro-out' : ''}`}
      id="introScreen"
      role="dialog"
      aria-label="Intro Animasi Terranova Store"
    >
      <div className="intro-bg" id="introBg" aria-hidden="true">
        {spaceLayers && (
          <>
            <div className="galaxy-nebula n1" />
            <div className="galaxy-nebula n2" />
            <div className="star-layer star-layer-intro-bg">
              <div className="star-points" style={{ boxShadow: spaceLayers.introStars }} />
              <div className="star-points star-points-clone-slow" style={{ boxShadow: spaceLayers.introStars }} />
            </div>
          </>
        )}
      </div>

      <button
        className="intro-skip"
        id="introSkip"
        type="button"
        aria-label="Lewati animasi intro"
        onClick={endIntro}
      >
        <span>Lewati Intro</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="13"
          height="13"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polygon points="5 4 15 12 5 20 5 4" />
          <line x1="19" y1="5" x2="19" y2="19" />
        </svg>
      </button>

      <div className="intro-stage" id="introStage">
        {/* 1. Permukaan Bumi & Landasan Peluncuran (Launchpad) */}
        <div className="earth-horizon" aria-hidden="true">
          <div className="earth-atmosphere" />
          <div className="earth-surface">
            <div className="launch-pad">
              <div className="launch-tower" />
              <div className="launch-smoke-ring" />
              <div className="launch-smoke-plume" />
            </div>
          </div>
        </div>

        {/* 2. Roket & Semburan Api (Thruster Flames) */}
        <div className="rocket-container" id="introRocket" aria-hidden="true">
          <div className="rocket-ship">
            <svg
              className="rocket-svg"
              viewBox="0 0 120 240"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M60 10 C45 45, 36 90, 36 150 L84 150 C84 90, 75 45, 60 10 Z"
                fill="url(#rocketBodyGrad)"
                stroke="rgba(34,211,238,0.6)"
                strokeWidth="2"
              />
              <path
                d="M60 10 C54 28, 48 45, 46 60 L74 60 C72 45, 66 28, 60 10 Z"
                fill="url(#noseConeGrad)"
              />
              <circle cx="60" cy="85" r="14" fill="#070a17" stroke="#22d3ee" strokeWidth="2.5" />
              <circle cx="60" cy="85" r="10" fill="url(#windowGrad)" />
              <ellipse cx="57" cy="81" rx="4" ry="2" fill="#ffffff" opacity="0.8" />
              <path
                d="M36 125 L14 175 C10 185, 20 188, 36 182 L36 145 Z"
                fill="url(#finLeftGrad)"
                stroke="rgba(34,211,238,0.5)"
                strokeWidth="1.5"
              />
              <path
                d="M84 125 L106 175 C110 185, 100 188, 84 182 L84 145 Z"
                fill="url(#finRightGrad)"
                stroke="rgba(34,211,238,0.5)"
                strokeWidth="1.5"
              />
              <rect x="58" y="105" width="4" height="45" rx="2" fill="#22d3ee" opacity="0.75" />
              <path d="M42 150 L38 165 L52 165 L50 150 Z" fill="#334155" stroke="#475569" strokeWidth="1" />
              <path d="M54 150 L52 167 L68 167 L66 150 Z" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
              <path d="M70 150 L68 165 L82 165 L78 150 Z" fill="#334155" stroke="#475569" strokeWidth="1" />

              <defs>
                <linearGradient id="rocketBodyGrad" x1="36" y1="10" x2="84" y2="150" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="45%" stopColor="#e2e8f0" />
                  <stop offset="75%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#475569" />
                </linearGradient>
                <linearGradient id="noseConeGrad" x1="46" y1="10" x2="74" y2="60" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#ff3366" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
                <radialGradient id="windowGrad" cx="60" cy="85" r="10" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="70%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#0f172a" />
                </radialGradient>
                <linearGradient id="finLeftGrad" x1="14" y1="125" x2="36" y2="182" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#1e1b4b" />
                </linearGradient>
                <linearGradient id="finRightGrad" x1="106" y1="125" x2="84" y2="182" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#1e1b4b" />
                </linearGradient>
              </defs>
            </svg>

            <div className="rocket-thruster-flames">
              <div className="flame flame-outer" />
              <div className="flame flame-main" />
              <div className="flame flame-inner" />
              <div className="flame flame-core" />
              <div className="flame-sparks" />
            </div>
          </div>
        </div>

        {/* 3. Bintang & Kosmik Luar Angkasa */}
        <div className="deep-space-cosmos" id="introCosmos" aria-hidden="true">
          {spaceLayers && (
            <>
              <div className="star-layer star-layer-intro-cosmos">
                <div className="star-points" style={{ boxShadow: spaceLayers.cosmosStars }} />
                <div className="star-points star-points-clone-fast" style={{ boxShadow: spaceLayers.cosmosStars }} />
              </div>
              <div className="meteor m1" />
              <div className="meteor m2" />
            </>
          )}
        </div>

        {/* 4. Tipografi Animasi Per-Huruf: TERRANOVA STORE */}
        <div className="intro-typography" id="introTypo">
          <div className="intro-logo-wrap">
            <img
              src="/assets/images/logo-kucing-poster.webp"
              alt="Terranova Profile"
              className="intro-logo-media"
              loading="eager"
              decoding="async"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="intro-words-group">
            <div className="intro-word" id="introWordTerranova" aria-label="TERRANOVA">
              {WORD_TERRANOVA.map((char, idx) => (
                <span
                  key={idx}
                  className="intro-char"
                  style={{ '--char-i': idx } as React.CSSProperties}
                >
                  {char}
                </span>
              ))}
            </div>

            <div className="intro-word intro-word-store" id="introWordStore" aria-label="STORE">
              {WORD_STORE.map((char, idx) => (
                <span
                  key={idx}
                  className="intro-char char-accent"
                  style={{ '--char-i': idx + WORD_TERRANOVA.length } as React.CSSProperties}
                >
                  {char}
                </span>
              ))}
            </div>
          </div>

          <p className="intro-tagline" id="introTagline">
            Premium Apps &amp; Top Up Game
          </p>
        </div>
      </div>
    </div>
  );
};
