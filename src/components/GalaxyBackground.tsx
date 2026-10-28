import React, { useEffect, useMemo, useState } from 'react';

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
  const [viewportWidth, setViewportWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? Math.max(window.innerWidth, 360) : 1440
  );

  useEffect(() => {
    let resizeTimer: number | null = null;
    const handleResize = () => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        const nextWidth = Math.max(window.innerWidth, 360);
        setViewportWidth((prev) => (Math.abs(nextWidth - prev) > 120 ? nextWidth : prev));
      }, 250);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimer) window.clearTimeout(resizeTimer);
    };
  }, []);

  const stars = useMemo(() => {
    const isCompact = viewportWidth <= 768;
    const spreadX = Math.max(viewportWidth, 420);
    const tileSmall = 2000;
    const tileMedium = 1400;

    const smallCount = isCompact ? 95 : 135;
    const mediumCount = isCompact ? 40 : 58;

    const smallStars = generateStarShadow(
      smallCount,
      spreadX,
      tileSmall,
      () => `rgba(255,255,255,${(0.55 + Math.random() * 0.45).toFixed(2)})`
    );
    const mediumStars = generateStarShadow(
      mediumCount,
      spreadX,
      tileMedium,
      () => `rgba(34,211,238,${(0.68 + Math.random() * 0.32).toFixed(2)}) 0 0 1.5px`
    );

    return {
      smallStars,
      mediumStars,
    };
  }, [viewportWidth]);

  return (
    <div className="galaxy-bg" aria-hidden="true">
      <div className="galaxy-nebula n1" />
      <div className="galaxy-nebula n2" />
      <div className="galaxy-nebula n3" />

      <div className="star-layer star-layer-slow">
        <div className="star-points" style={{ boxShadow: stars.smallStars }} />
        <div className="star-points star-points-clone-slow" style={{ boxShadow: stars.smallStars }} />
      </div>

      <div className="star-layer star-layer-fast">
        <div className="star-points" style={{ boxShadow: stars.mediumStars }} />
        <div className="star-points star-points-clone-fast" style={{ boxShadow: stars.mediumStars }} />
      </div>

      <div className="meteor m1" />
      <div className="meteor m2" />
      <div className="meteor m3" />
      <div className="meteor m4" />
    </div>
  );
};
