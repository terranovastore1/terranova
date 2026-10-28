import React, { useMemo } from 'react';

export function generateStarShadow(
  count: number,
  spreadX: number,
  spreadY: number,
  colorFn: () => string
): string {
  const shadows: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.round(Math.random() * spreadX);
    const y = Math.round(Math.random() * spreadY);
    shadows.push(`${x}px ${y}px ${colorFn()}`);
  }
  return shadows.join(', ');
}

export const GalaxyBackground: React.FC = () => {
  const config = useMemo(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const isLowPowerDevice =
      typeof navigator !== 'undefined' &&
      typeof navigator.hardwareConcurrency === 'number' &&
      navigator.hardwareConcurrency <= 4;
    const reduceParticles = isMobile || isLowPowerDevice || prefersReducedMotion;

    const spreadX = Math.max(typeof window !== 'undefined' ? window.innerWidth : 1440, 1200);
    const tileSmall = 2000;
    const tileMedium = 1400;

    const smallCount = isMobile ? 65 : reduceParticles ? 50 : 120;
    const mediumCount = isMobile ? 25 : reduceParticles ? 25 : 50;

    const smallStars = generateStarShadow(
      smallCount,
      spreadX,
      tileSmall,
      () => `rgba(255,255,255,${(0.5 + Math.random() * 0.45).toFixed(2)})`
    );
    const mediumStars = generateStarShadow(
      mediumCount,
      spreadX,
      tileMedium,
      () => `rgba(34,211,238,${(0.65 + Math.random() * 0.35).toFixed(2)}) 0 0 1px`
    );

    return {
      isMobile,
      prefersReducedMotion,
      reduceParticles,
      tileSmall,
      tileMedium,
      smallStars,
      mediumStars,
    };
  }, []);

  if (config.isMobile) {
    return (
      <div className="galaxy-bg" aria-hidden="true">
        <div
          className="galaxy-nebula n1"
          style={{ animation: 'none', filter: 'blur(40px)', opacity: 0.42 }}
        />
        <div
          className="galaxy-nebula n2"
          style={{ animation: 'none', filter: 'blur(40px)', opacity: 0.32 }}
        />
        <div
          className="galaxy-nebula n3"
          style={{ animation: 'none', filter: 'blur(40px)', opacity: 0.25 }}
        />
        <div
          className="star-layer"
          style={
            {
              '--star-shadow': config.smallStars,
              '--star-tile': `${config.tileSmall}px`,
              animation: 'none',
            } as React.CSSProperties
          }
        />
        <div
          className="star-layer"
          style={
            {
              '--star-shadow': config.mediumStars,
              '--star-tile': `${config.tileMedium}px`,
              animation: 'none',
            } as React.CSSProperties
          }
        />
      </div>
    );
  }

  return (
    <div className="galaxy-bg" aria-hidden="true">
      <div className="galaxy-nebula n1" />
      <div className="galaxy-nebula n2" />
      <div className="galaxy-nebula n3" />
      <div
        className="star-layer"
        style={
          {
            '--star-shadow': config.smallStars,
            '--star-tile': `${config.tileSmall}px`,
            animationDuration: '170s',
          } as React.CSSProperties
        }
      />
      <div
        className="star-layer"
        style={
          {
            '--star-shadow': config.mediumStars,
            '--star-tile': `${config.tileMedium}px`,
            animationDuration: '110s',
          } as React.CSSProperties
        }
      />
      {!config.prefersReducedMotion && (
        <>
          <div className="meteor m1" />
          <div className="meteor m2" />
        </>
      )}
      {!config.prefersReducedMotion && !config.reduceParticles && (
        <>
          <div className="meteor m3" />
          <div className="meteor m4" />
        </>
      )}
    </div>
  );
};
