import React, { useEffect } from 'react';
import { useStore } from '../context/StoreContext';

export const InfoModal: React.FC = () => {
  const { infoModalType, closeInfoModal } = useStore();
  const isOpen = infoModalType !== null;

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeInfoModal();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      if (!document.body.classList.contains('intro-active')) {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen, closeInfoModal]);

  const isTerms = infoModalType === 'terms';

  return (
    <div
      className={`order-modal-backdrop ${isOpen ? 'active' : ''}`}
      aria-hidden={!isOpen}
      style={
        {
          '--modal-accent': 'var(--cyan)',
          '--modal-glow': 'rgba(var(--cyan-rgb), 0.3)',
        } as React.CSSProperties
      }
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeInfoModal();
        }
      }}
    >
      <div className="order-modal" role="dialog" aria-modal="true">
        <div className="order-modal-header">
          <div className="order-modal-title-wrap">
            <span className="order-modal-icon" style={{ fontSize: '1.4rem' }}>
              {isTerms ? '📄' : '🔒'}
            </span>
            <div>
              <span className="order-modal-tag">TERRANOVA STORE</span>
              <h3 className="order-modal-title">
                {isTerms ? 'Syarat & Ketentuan' : 'Kebijakan Privasi'}
              </h3>
            </div>
          </div>
          <button
            type="button"
            className="order-modal-close"
            aria-label="Tutup informasi"
            onClick={closeInfoModal}
          >
            &times;
          </button>
        </div>

        <div className="order-modal-body">
          {isTerms ? (
            <>
              <p className="order-modal-desc">
                1. Harga dan ketersediaan produk dapat berubah sewaktu-waktu. Silakan konfirmasi harga terbaru kepada Admin WhatsApp sebelum melakukan pembayaran.
              </p>
              <p className="order-modal-desc">
                2. Garansi berlaku sesuai masa aktif dan tipe paket yang dipesan (Sharing / Private / Full Garansi) selama pembeli mematuhi panduan penggunaan akun dari Admin.
              </p>
              <p className="order-modal-desc">
                3. Untuk layanan Top Up Game, pastikan User ID / Zone ID yang diberikan sudah benar. Kesalahan input ID oleh pembeli di luar tanggung jawab toko.
              </p>
            </>
          ) : (
            <>
              <p className="order-modal-desc">
                1. Data kontak seperti nomor WhatsApp, alamat email akun, atau User ID game hanya digunakan semata-mata untuk memproses pesanan dan pengiriman layanan.
              </p>
              <p className="order-modal-desc">
                2. Terranova Store menjaga kerahasiaan data pelanggan dan tidak membagikan informasi pribadi kepada pihak ketiga mana pun.
              </p>
              <p className="order-modal-desc">
                3. Transaksi pembayaran dilakukan secara aman melalui QRIS resmi yang dikonfirmasi langsung bersama Admin Terranova Store.
              </p>
            </>
          )}
        </div>

        <div className="order-modal-footer">
          <button type="button" className="btn-modal-cancel" onClick={closeInfoModal}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
