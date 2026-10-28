import React, { useState } from 'react';
import type { Product } from '../types/product';
import {
  CATEGORY_MAP,
  parsePriceInfo,
  productHasPackages,
  resolveAssetUrl,
} from '../constants/storeConfig';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
  showCategoryTag?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, showCategoryTag = false }) => {
  const { openOrderModal } = useStore();
  const [imgSrc, setImgSrc] = useState<string>(() =>
    resolveAssetUrl(product.iconUrl, product.name)
  );

  // Sync if product.iconUrl updates from admin
  React.useEffect(() => {
    setImgSrc(resolveAssetUrl(product.iconUrl, product.name));
  }, [product.iconUrl, product.name]);

  const catMeta = CATEGORY_MAP[product.category];
  const accentClass = catMeta ? catMeta.productCardAccent : 'accent-cyan';
  const hasPkg = productHasPackages(product);

  const rawSinglePrice =
    product.price ||
    (product.packages && product.packages[0] ? product.packages[0].price : 'Rp XX.XXX');
  const singlePriceInfo = parsePriceInfo(rawSinglePrice);

  const handleCardClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, a, input')) return;
    openOrderModal(product, 0);
  };

  return (
    <article
      className={`product-card reveal in-view ${accentClass}`}
      onClick={handleCardClick}
    >
      {product.badge && product.badge.trim() !== '' && (
        <span className="product-badge">{product.badge}</span>
      )}

      {showCategoryTag && (
        <span className="product-category-tag">
          {catMeta ? catMeta.label : product.category}
        </span>
      )}

      <span className="product-icon">
        <img
          src={imgSrc}
          alt={`Logo Asli ${product.name}`}
          className="app-official-icon"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => {
            if (imgSrc !== '/assets/images/apps/netflix.webp') {
              setImgSrc('/assets/images/apps/netflix.webp');
            }
          }}
        />
      </span>

      <h3 className="product-name">{product.name}</h3>
      <p className="product-desc">{product.description}</p>

      {hasPkg && Array.isArray(product.packages) && product.packages.length > 0 ? (
        <div className="package-list">
          {product.packages.map((pkg, idx) => (
            <button
              key={`${pkg.label}-${idx}`}
              type="button"
              className="package-row"
              title={`Order paket ${pkg.label}`}
              onClick={(e) => {
                e.stopPropagation();
                openOrderModal(product, idx);
              }}
            >
              <span className="package-label">{pkg.label}</span>
              <span className="package-price">{pkg.price}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="product-single-price-box">
          <span className="single-price-label">Harga</span>
          <span className="single-price-val">{singlePriceInfo.display}</span>
        </div>
      )}

      <button
        type="button"
        className="btn-order"
        onClick={(e) => {
          e.stopPropagation();
          openOrderModal(product, 0);
        }}
      >
        ORDER {product.name.toUpperCase()}
      </button>
    </article>
  );
};
