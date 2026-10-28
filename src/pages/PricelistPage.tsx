import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CATEGORIES,
  parsePriceInfo,
  productHasPackages,
} from '../constants/storeConfig';
import { useStore } from '../context/StoreContext';
import { StoreLayout } from '../components/StoreLayout';

export const PricelistPage: React.FC = () => {
  const { products, openOrderModal } = useStore();

  useEffect(() => {
    document.title = 'Pricelist APK | Terranova Store';
  }, []);

  const handleBackHome = () => {
    try {
      sessionStorage.setItem('terranova_navigated_back', 'true');
    } catch {
      // Ignore storage restrictions
    }
  };

  return (
    <StoreLayout>
      <div className="page-lead">
        <Link to="/" className="back-home" onClick={handleBackHome}>
          <span className="back-home-badge" aria-hidden="true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </span>
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      <section className="pricelist" id="pricelist">
        <h2 className="section-title">💰 PRICELIST APK</h2>
        <p className="section-subtitle">Ringkasan harga per kategori</p>

        <div className="pricelist-grid" id="pricelistGrid">
          {CATEGORIES.map((cat) => {
            const items = products.filter(
              (p) => p.category === cat.key && p.active !== false
            );
            if (items.length === 0) return null;

            return (
              <div
                key={cat.key}
                className={`pricelist-card reveal in-view pricelist-accent-${cat.key}`}
              >
                <div className="pricelist-card-title">{cat.label}</div>
                {items.map((product) => {
                  const hasPkg = productHasPackages(product);
                  const rawPrice =
                    hasPkg && Array.isArray(product.packages) && product.packages[0]
                      ? product.packages[0].price
                      : product.price ||
                        (product.packages && product.packages[0]
                          ? product.packages[0].price
                          : 'Rp XX.XXX');
                  const pInfo = parsePriceInfo(rawPrice);

                  return (
                    <div
                      key={product.id}
                      className="pricelist-item pricelist-clickable"
                      data-product-name={product.name}
                      tabIndex={0}
                      role="button"
                      title={`Pesan ${product.name}`}
                      onClick={() => openOrderModal(product, 0)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openOrderModal(product, 0);
                        }
                      }}
                    >
                      <span className="pricelist-item-name">{product.name}</span>
                      <span className="pricelist-item-price">
                        {pInfo.display} <span className="pricelist-arrow">→</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </section>
    </StoreLayout>
  );
};
