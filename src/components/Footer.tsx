import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { STORE_CONFIG, buildWhatsAppLink } from '../constants/storeConfig';
import { useStore } from '../context/StoreContext';
import { scrollToElementWithOffset } from './StoreHeader';

export const Footer: React.FC = () => {
  const { openInfoModal } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  const waLink = buildWhatsAppLink(
    'Halo Kak Admin Terranova Store! Mau tanya-tanya produk dan pricelist terbarunya ya kak, terima kasih!'
  );

  const handleContactClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (location.pathname === '/' || location.pathname === '/index.html') {
      scrollToElementWithOffset('#quick-contact');
    } else {
      try {
        sessionStorage.setItem('terranova_navigated_back', 'true');
      } catch {
        // Ignore storage errors
      }
      navigate('/#quick-contact');
    }
  };

  return (
    <footer className="footer">
      <div className="footer-brand">TERRANOVA STORE</div>
      <div className="footer-slogan">Premium Apps &amp; Top Up Game</div>

      <div className="footer-social">
        <a
          href={waLink}
          id="footerWhatsapp"
          className="footer-social-icon"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp Terranova Store"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#25D366"
              d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"
            />
          </svg>
        </a>
        <a
          href={STORE_CONFIG.instagram}
          id="footerInstagram"
          className="footer-social-icon"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram Terranova Store"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="32" height="32" aria-hidden="true">
            <radialGradient id="ig-grad1-f" cx="19.379" cy="42.035" r="44.899" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#fd5" />
              <stop offset=".328" stopColor="#ff543f" />
              <stop offset=".348" stopColor="#fc5245" />
              <stop offset=".504" stopColor="#e64771" />
              <stop offset=".643" stopColor="#d53e91" />
              <stop offset=".761" stopColor="#cc39a4" />
              <stop offset=".841" stopColor="#c837ab" />
            </radialGradient>
            <path
              fill="url(#ig-grad1-f)"
              d="M34.017 41.99l-20 .019c-4.4.004-8.003-3.592-8.008-7.992l-.019-20c-.004-4.4 3.592-8.003 7.992-8.008l20-.019c4.4-.004 8.003 3.592 8.008 7.992l.019 20c.005 4.401-3.592 8.004-7.992 8.008z"
            />
            <radialGradient id="ig-grad2-f" cx="11.786" cy="5.54" r="29.813" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#4168c9" />
              <stop offset=".999" stopColor="#4168c9" stopOpacity="0" />
            </radialGradient>
            <path
              fill="url(#ig-grad2-f)"
              d="M34.017 41.99l-20 .019c-4.4.004-8.003-3.592-8.008-7.992l-.019-20c-.004-4.4 3.592-8.003 7.992-8.008l20-.019c4.4-.004 8.003 3.592 8.008 7.992l.019 20c.005 4.401-3.592 8.004-7.992 8.008z"
            />
            <path
              fill="#fff"
              d="M24 31c-3.859 0-7-3.14-7-7s3.141-7 7-7 7 3.14 7 7-3.141 7-7 7zm0-12c-2.757 0-5 2.243-5 5s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5z"
            />
            <circle cx="31.5" cy="16.5" r="1.5" fill="#fff" />
            <path
              fill="#fff"
              d="M30 37H18c-3.859 0-7-3.14-7-7V18c0-3.86 3.141-7 7-7h12c3.859 0 7 3.14 7 7v12c0 3.86-3.141 7-7 7zM18 13c-2.757 0-5 2.243-5 5v12c0 2.757 2.243 5 5 5h12c2.757 0 5-2.243 5-5V18c0-2.757-2.243-5-5-5H18z"
            />
          </svg>
        </a>
        <a
          href={STORE_CONFIG.tiktok}
          id="footerTiktok"
          className="footer-social-icon"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="TikTok Terranova Store"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 28 28" aria-hidden="true">
            <path
              fill="#25f4ee"
              transform="translate(-0.7,0)"
              d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
            />
            <path
              fill="#fe2c55"
              transform="translate(0.7,0)"
              d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
            />
            <path
              fill="#fff"
              d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
            />
          </svg>
        </a>
      </div>

      <div className="footer-links">
        <a
          href="#terms"
          onClick={(e) => {
            e.preventDefault();
            openInfoModal('terms');
          }}
        >
          <span className="ui-emoji" aria-hidden="true">
            📄
          </span>{' '}
          <span>Syarat &amp; Ketentuan</span>
        </a>
        <span>•</span>
        <a
          href="#privacy"
          onClick={(e) => {
            e.preventDefault();
            openInfoModal('privacy');
          }}
        >
          <span className="ui-emoji" aria-hidden="true">
            🔒
          </span>{' '}
          <span>Kebijakan Privasi</span>
        </a>
        <span>•</span>
        <a href="/#quick-contact" onClick={handleContactClick}>
          <span className="ui-emoji" aria-hidden="true">
            💬
          </span>{' '}
          <span>Hubungi Kami</span>
        </a>
      </div>
      <div className="footer-copy">© 2026 Terranova Store</div>
    </footer>
  );
};
