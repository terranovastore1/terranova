import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <article className="product-card skeleton-card" aria-hidden="true">
      <div className="skeleton-shimmer" />
      <div className="skeleton-line skeleton-tag" />
      <div className="skeleton-circle" />
      <div className="skeleton-line skeleton-title" />
      <div className="skeleton-line skeleton-desc" />
      <div className="skeleton-line skeleton-desc-short" />
      <div className="skeleton-packages">
        <div className="skeleton-line skeleton-pkg" />
        <div className="skeleton-line skeleton-pkg" />
      </div>
      <div className="skeleton-line skeleton-btn" />
    </article>
  );
};
