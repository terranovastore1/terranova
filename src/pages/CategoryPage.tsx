import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { ProductCategory } from '../types/product';
import { CATEGORY_MAP } from '../constants/storeConfig';
import { useStore } from '../context/StoreContext';
import { StoreLayout } from '../components/StoreLayout';
import { ProductCard } from '../components/ProductCard';

interface CategoryPageProps {
  category: ProductCategory;
}

const PAGE_TITLES: Record<ProductCategory, string> = {
  streaming: 'APK Streaming | Terranova Store',
  editing: 'APK Editing | Terranova Store',
  listening: 'APK Listening | Terranova Store',
  study: 'APK Study | Terranova Store',
  lainnya: 'APK Lainnya | Terranova Store',
  topup: 'Top Up Game | Terranova Store',
};

export const CategoryPage: React.FC<CategoryPageProps> = ({ category }) => {
  const { products } = useStore();
  const catMeta = CATEGORY_MAP[category];

  useEffect(() => {
    document.title = PAGE_TITLES[category] || 'Terranova Store';
  }, [category]);

  const activeCategoryProducts = products.filter(
    (product) => product.category === category && product.active !== false
  );

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

      <section className={`product-section ${catMeta.sectionAccent}`} id={category}>
        <h2 className="section-title">{catMeta.sectionTitle}</h2>
        <p className="section-subtitle">{catMeta.sectionSubtitle}</p>

        {activeCategoryProducts.length > 0 ? (
          <div className="product-grid" id={`grid-${category}`}>
            {activeCategoryProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="search-empty">
            <div className="search-empty-icon">📦</div>
            <div className="search-empty-title">Belum ada produk aktif di kategori ini</div>
            <p className="search-empty-desc">
              Silakan cek kategori lainnya atau kembali ke halaman utama katalog.
            </p>
          </div>
        )}
      </section>
    </StoreLayout>
  );
};
