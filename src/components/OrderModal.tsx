import React, { useEffect, useState } from 'react';
import {
  CATEGORY_MAP,
  buildOrderWhatsAppMessage,
  buildWhatsAppLink,
  parsePriceInfo,
  productHasPackages,
  resolveAssetUrl,
} from '../constants/storeConfig';
import { useStore } from '../context/StoreContext';

export const OrderModal: React.FC = () => {
  const { orderModal, closeOrderModal } = useStore();
  const { isOpen, product, initialPackageIndex } = orderModal;

  const [selectedPkgIndex, setSelectedPkgIndex] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('QRIS');
  const [notes, setNotes] = useState<string>('');
  const [imgSrc, setImgSrc] = useState<string>('/assets/images/apps/netflix.webp');

  useEffect(() => {
    if (product && isOpen) {
      const hasPkg = productHasPackages(product);
      const boundedIdx =
        hasPkg && Array.isArray(product.packages) && product.packages.length > 0
          ? Math.min(Math.max(0, initialPackageIndex), product.packages.length - 1)
          : 0;
      setSelectedPkgIndex(boundedIdx);
      setPaymentMethod('QRIS');
      setNotes('');
      setImgSrc(resolveAssetUrl(product.iconUrl, product.name));
    }
  }, [product, initialPackageIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeOrderModal();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      if (!document.body.classList.contains('intro-active')) {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen, closeOrderModal]);

  const catMeta = product ? CATEGORY_MAP[product.category] : CATEGORY_MAP.streaming;
  const hasPkg = product ? productHasPackages(product) : false;
  const currentPkg =
    product && hasPkg && Array.isArray(product.packages) && product.packages.length > 0
      ? product.packages[selectedPkgIndex] || product.packages[0]
      : null;

  const rawPrice = product
    ? currentPkg
      ? currentPkg.price
      : product.price ||
        (product.packages && product.packages[0] ? product.packages[0].price : 'Rp XX.XXX')
    : 'Rp XX.XXX';
  const priceInfo = parsePriceInfo(rawPrice);

  const waHref = product
    ? buildWhatsAppLink(
        buildOrderWhatsAppMessage(product, selectedPkgIndex, paymentMethod, notes)
      )
    : '#';

  return (
    <div
      id="orderModalBackdrop"
      className={`order-modal-backdrop ${isOpen && product ? 'active' : ''}`}
      aria-hidden={!(isOpen && product)}
      style={
        {
          '--modal-accent': catMeta?.pricelistAccent || 'var(--crimson-red)',
          '--modal-glow': catMeta?.pricelistGlow || 'rgba(var(--crimson-red-rgb), 0.35)',
        } as React.CSSProperties
      }
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeOrderModal();
        }
      }}
    >
      <div
        className="order-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="orderModalTitle"
      >
        <div className="order-modal-header">
          <div className="order-modal-title-wrap">
            <span id="orderModalIcon" className="order-modal-icon">
              {product ? (
                <img
                  src={imgSrc}
                  alt={`Logo Asli ${product.name}`}
                  className="app-official-icon"
                  referrerPolicy="no-referrer"
                  onError={() => {
                    if (imgSrc !== '/assets/images/apps/netflix.webp') {
                      setImgSrc('/assets/images/apps/netflix.webp');
                    }
                  }}
                />
              ) : (
                '📦'
              )}
            </span>
            <div>
              <span id="orderModalTag" className="order-modal-tag">
                {catMeta ? catMeta.label : product?.category || 'KATEGORI'}
              </span>
              <h3 id="orderModalTitle" className="order-modal-title">
                {product?.name || 'Nama Produk'}
              </h3>
            </div>
          </div>
          <button
            type="button"
            id="orderModalClose"
            className="order-modal-close"
            aria-label="Tutup popup order"
            onClick={closeOrderModal}
          >
            &times;
          </button>
        </div>

        <div className="order-modal-body">
          <p id="orderModalDesc" className="order-modal-desc">
            {product?.description || ''}
          </p>

          {product && hasPkg && Array.isArray(product.packages) && product.packages.length > 0 && (
            <div className="order-modal-section" id="orderModalPackagesSection">
              <label className="order-modal-label">Pilih Paket / Varian:</label>
              <div id="orderModalPackages" className="order-packages-grid">
                {product.packages.map((pkg, idx) => (
                  <button
                    key={`${pkg.label}-${idx}`}
                    type="button"
                    className={`order-package-card ${idx === selectedPkgIndex ? 'active' : ''}`}
                    onClick={() => setSelectedPkgIndex(idx)}
                  >
                    <span className="order-package-label">{pkg.label}</span>
                    <span className="order-package-price">{pkg.price}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="order-modal-section">
            <label className="order-modal-label">Pilihan Metode Pembayaran:</label>
            <div
              id="orderModalPayments"
              className="order-payments-grid"
              style={{ gridTemplateColumns: '1fr' }}
            >
              <button
                type="button"
                className={`payment-pill ${paymentMethod === 'QRIS' ? 'active' : ''}`}
                data-payment="QRIS"
                style={{ justifyContent: 'center', cursor: 'default' }}
                onClick={() => setPaymentMethod('QRIS')}
              >
                <span>⚡</span> QRIS (Semua E-Wallet &amp; Bank Transfer)
              </button>
            </div>
          </div>

          <div className="order-modal-section">
            <label htmlFor="orderModalNotes" className="order-modal-label">
              Catatan / Email Akun (Opsional):
            </label>
            <input
              type="text"
              id="orderModalNotes"
              className="order-modal-input"
              placeholder="Contoh: Email saya abc@gmail.com / akun baru"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="order-summary-box">
            {hasPkg && currentPkg && (
              <div className="order-summary-row" id="orderSummaryPkgRow">
                <span className="summary-label">Paket Dipilih:</span>
                <span id="orderSummaryPkg" className="summary-value">
                  {currentPkg.label}
                </span>
              </div>
            )}
            <div className="order-summary-row">
              <span className="summary-label">Total Harga:</span>
              <span id="orderSummaryPrice" className="summary-value price-highlight">
                {priceInfo.display}
              </span>
            </div>
            <div className="order-summary-row">
              <span className="summary-label">Metode Pembayaran:</span>
              <span id="orderSummaryPay" className="summary-value">
                {paymentMethod}
              </span>
            </div>
          </div>
        </div>

        <div className="order-modal-footer">
          <button
            type="button"
            id="orderModalCancel"
            className="btn-modal-cancel"
            onClick={closeOrderModal}
          >
            Batal
          </button>
          <a
            id="orderModalSubmit"
            className="btn-modal-whatsapp"
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              className="wa-btn-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
            <span>Lanjut ke WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
