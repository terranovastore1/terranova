import type { CategoryMeta, Product, ProductCategory } from '../types/product';

export const STORE_CONFIG = {
  whatsapp: '628967198609',
  whatsappLink: 'https://wa.me/628967198609',
  group: 'https://chat.whatsapp.com/BielVf93ytvLI20G5amjjp?s=cl&p=a&mlu=4&ilr=4',
  instagram: 'https://www.instagram.com/_terranovastore/',
  tiktok: 'https://www.tiktok.com/@_terranovastore',
};

export const APP_ICONS: Record<string, string> = {
  'Netflix Premium': '/assets/images/apps/netflix.webp',
  'Vidio Platinum': '/assets/images/apps/vidio.webp',
  'VIU Premium': '/assets/images/apps/viu.webp',
  'YouTube Premium': '/assets/images/apps/youtube.webp',
  'Canva Pro': '/assets/images/apps/canva.webp',
  'CapCut Pro': '/assets/images/apps/capcut.webp',
  'FaceApp Pro': '/assets/images/apps/faceapp.webp',
  'PicsArt Premium': '/assets/images/apps/picsart.webp',
  'Adobe Lightroom Premium': '/assets/images/apps/lightroom.webp',
  'VSCO Membership': '/assets/images/apps/vsco.webp',
  'Remini Premium': '/assets/images/apps/remini.webp',
  'VN Editor Pro': '/assets/images/apps/vn.webp',
  'Spotify Premium': '/assets/images/apps/spotify.webp',
  'Apple Music': '/assets/images/apps/apple-music.webp',
  'Quizlet Plus': '/assets/images/apps/quizlet.webp',
  'Brainly Plus': '/assets/images/apps/brainly.webp',
  'CamScanner Premium': '/assets/images/apps/camscanner.webp',
  'GetContact Premium': '/assets/images/apps/getcontact.webp',
  'Wattpad Premium': '/assets/images/apps/wattpad.webp',
  'VPN Premium': '/assets/images/apps/vpn.webp',
  'Mobile Legends': '/assets/images/apps/mobile-legends.webp',
  'Free Fire': '/assets/images/apps/free-fire.webp',
  'PUBG Mobile': '/assets/images/apps/pubg-mobile.webp',
  'Roblox': '/assets/images/apps/roblox.webp',
};

export function resolveAssetUrl(rawUrl?: string, fallbackName?: string): string {
  if (rawUrl && rawUrl.trim()) {
    const trimmed = rawUrl.trim();
    if (
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('data:') ||
      trimmed.startsWith('/')
    ) {
      return trimmed;
    }
    return `/${trimmed}`;
  }
  if (fallbackName && APP_ICONS[fallbackName]) {
    return APP_ICONS[fallbackName];
  }
  return '/assets/images/apps/netflix.webp';
}

export const CATEGORIES: CategoryMeta[] = [
  {
    key: 'streaming',
    label: '📺 APK STREAMING',
    shortLabel: '📺 Streaming',
    adminLabel: '📺 Streaming',
    emoji: '📺',
    path: '/streaming',
    sectionTitle: '📺 APK STREAMING',
    sectionSubtitle: 'Streaming hiburan favoritmu!',
    categoryCardName: 'APK STREAMING',
    categoryCardAccent: 'accent-red',
    sectionAccent: 'accent-red',
    productCardAccent: 'accent-cyan',
    pricelistAccent: 'var(--crimson-red)',
    pricelistGlow: 'rgba(var(--crimson-red-rgb), 0.35)',
  },
  {
    key: 'editing',
    label: '🎬 APK EDITING',
    shortLabel: '🎬 Editing',
    adminLabel: '🎬 Editing',
    emoji: '🎬',
    path: '/editing',
    sectionTitle: '🎬 APK EDITING',
    sectionSubtitle: 'Tools untuk kebutuhan editing!',
    categoryCardName: 'APK EDITING',
    categoryCardAccent: 'accent-purple',
    sectionAccent: 'accent-purple',
    productCardAccent: 'accent-purple',
    pricelistAccent: 'var(--purple)',
    pricelistGlow: 'rgba(var(--purple-rgb), 0.32)',
  },
  {
    key: 'listening',
    label: '🎵 APK LISTENING',
    shortLabel: '🎵 Listening',
    adminLabel: '🎵 Musik',
    emoji: '🎵',
    path: '/listening',
    sectionTitle: '🎵 APK LISTENING',
    sectionSubtitle: 'Dengarkan musik tanpa batas!',
    categoryCardName: 'APK LISTENING',
    categoryCardAccent: 'accent-magenta',
    sectionAccent: 'accent-magenta',
    productCardAccent: 'accent-magenta',
    pricelistAccent: 'var(--magenta)',
    pricelistGlow: 'rgba(var(--magenta-rgb), 0.32)',
  },
  {
    key: 'study',
    label: '📚 APK STUDY',
    shortLabel: '📚 Study',
    adminLabel: '📚 Edukasi',
    emoji: '📚',
    path: '/study',
    sectionTitle: '📚 APK STUDY',
    sectionSubtitle: 'Aplikasi untuk membantu kebutuhan belajar.',
    categoryCardName: 'APK STUDY',
    categoryCardAccent: 'accent-blue',
    sectionAccent: 'accent-blue',
    productCardAccent: 'accent-blue',
    pricelistAccent: 'var(--electric-blue)',
    pricelistGlow: 'rgba(var(--electric-blue-rgb), 0.32)',
  },
  {
    key: 'lainnya',
    label: '📦 APK LAINNYA',
    shortLabel: '📦 Lainnya',
    adminLabel: '📦 Lainnya',
    emoji: '📦',
    path: '/lainnya',
    sectionTitle: '📦 APK LAINNYA',
    sectionSubtitle: 'Kebutuhan digital lainnya.',
    categoryCardName: 'APK LAINNYA',
    categoryCardAccent: 'accent-gold',
    sectionAccent: 'accent-gold',
    productCardAccent: 'accent-gold',
    pricelistAccent: 'var(--gold)',
    pricelistGlow: 'rgba(var(--gold-rgb), 0.32)',
  },
  {
    key: 'topup',
    label: '🎮 TOP UP GAME',
    shortLabel: '🎮 Top Up',
    adminLabel: '🎮 Top Up',
    emoji: '🎮',
    path: '/topup',
    sectionTitle: '🎮 TOP UP GAME',
    sectionSubtitle: 'Top up game favoritmu, proses cepat & aman.',
    categoryCardName: 'TOP UP GAME',
    categoryCardAccent: 'accent-green',
    sectionAccent: 'accent-green',
    productCardAccent: 'accent-cyan',
    pricelistAccent: 'var(--cyber-green)',
    pricelistGlow: 'rgba(var(--cyber-green-rgb), 0.35)',
  },
];

export const CATEGORY_MAP: Record<ProductCategory, CategoryMeta> = CATEGORIES.reduce(
  (acc, item) => {
    acc[item.key] = item;
    return acc;
  },
  {} as Record<ProductCategory, CategoryMeta>
);

export function parsePriceInfo(priceStr?: string): {
  hasRealPrice: boolean;
  display: string;
  nominalOnly: string;
} {
  if (!priceStr) {
    return { hasRealPrice: false, display: 'Rp XX.XXX', nominalOnly: '' };
  }
  const clean = String(priceStr).trim();
  const isPlaceholder = /x{2,}/i.test(clean) || /^\?+$/.test(clean);
  if (isPlaceholder) {
    return { hasRealPrice: false, display: clean, nominalOnly: '' };
  }

  if (/^\d+$/.test(clean)) {
    const formatted = 'Rp ' + Number(clean).toLocaleString('id-ID');
    return { hasRealPrice: true, display: formatted, nominalOnly: formatted };
  }

  return { hasRealPrice: true, display: clean, nominalOnly: clean };
}

export function buildWhatsAppLink(message: string): string {
  return `${STORE_CONFIG.whatsappLink}?text=${encodeURIComponent(message)}`;
}

export function productHasPackages(product: Product): boolean {
  return (
    product.hasPackages === true ||
    (Array.isArray(product.packages) &&
      product.packages.length > 0 &&
      product.packages.some((pkg) => Boolean(pkg.label && pkg.label.trim())))
  );
}

export function buildOrderWhatsAppMessage(
  product: Product,
  packageIndex: number,
  paymentMethod: string,
  notes: string
): string {
  const hasPkg = productHasPackages(product);
  const currentPkg =
    hasPkg && Array.isArray(product.packages) && product.packages.length > 0
      ? product.packages[packageIndex] || product.packages[0]
      : null;

  const rawPrice = currentPkg
    ? currentPkg.price
    : product.price || (product.packages && product.packages[0] ? product.packages[0].price : '');
  const priceInfo = parsePriceInfo(rawPrice);

  let msg = `Halo Kak Admin Terranova Store! Mau order nih kak:\n\n`;
  msg += `Detail Pesanan:\n`;
  msg += `Produk: ${product.name}\n`;
  if (hasPkg && currentPkg && currentPkg.label && currentPkg.label.trim()) {
    msg += `Paket: ${currentPkg.label}\n`;
  }
  if (priceInfo.hasRealPrice) {
    msg += `Nominal Harga: ${priceInfo.nominalOnly}\n`;
  } else {
    msg += `Nominal Harga: ${priceInfo.display}\n`;
  }
  msg += `Metode Pembayaran: ${paymentMethod}\n`;
  if (notes.trim().length > 0) {
    msg += `Catatan: ${notes.trim()}\n`;
  }

  if (paymentMethod.toUpperCase().includes('QRIS')) {
    msg += `\nBoleh minta barcode QRIS-nya ya kak? Ditunggu kak, terima kasih!`;
  } else {
    msg += `\nBoleh minta info detail pembayarannya ya kak? Ditunggu kak, terima kasih!`;
  }

  return msg;
}

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'netflix-premium',
    name: 'Netflix Premium',
    category: 'streaming',
    iconUrl: 'assets/images/apps/netflix.webp',
    description: 'Nonton film & series favorit sepuasnya, kualitas Ultra HD.',
    badge: 'TERLARIS',
    active: true,
    packages: [
      { label: '1 Bulan', price: 'Rp XX.XXX' },
      { label: '2 Bulan', price: 'Rp XX.XXX' },
      { label: '3 Bulan', price: 'Rp XX.XXX' },
    ],
  },
  {
    id: 'vidio-platinum',
    name: 'Vidio Platinum',
    category: 'streaming',
    iconUrl: 'assets/images/apps/vidio.webp',
    description: 'Streaming film, series, dan siaran olahraga lokal.',
    badge: '',
    active: true,
    packages: [
      { label: '1 Bulan', price: 'Rp XX.XXX' },
      { label: '3 Bulan', price: 'Rp XX.XXX' },
    ],
  },
  {
    id: 'viu-premium',
    name: 'VIU Premium',
    category: 'streaming',
    iconUrl: 'assets/images/apps/viu.webp',
    description: 'Drama Asia dan tayangan eksklusif tanpa iklan.',
    badge: '',
    active: true,
    packages: [
      { label: '1 Bulan', price: 'Rp XX.XXX' },
      { label: '3 Bulan', price: 'Rp XX.XXX' },
    ],
  },
  {
    id: 'youtube-premium',
    name: 'YouTube Premium',
    category: 'streaming',
    iconUrl: 'assets/images/apps/youtube.webp',
    description: 'Bebas iklan, bisa diputar di latar belakang.',
    badge: 'POPULER',
    active: true,
    packages: [
      { label: '1 Bulan', price: 'Rp XX.XXX' },
      { label: '3 Bulan', price: 'Rp XX.XXX' },
      { label: '6 Bulan', price: 'Rp XX.XXX' },
    ],
  },
  {
    id: 'canva-pro',
    name: 'Canva Pro',
    category: 'editing',
    iconUrl: 'assets/images/apps/canva.webp',
    description: 'Desain grafis, konten sosial media, dan presentasi.',
    badge: 'BEST SELLER',
    active: true,
    packages: [
      { label: '1 Bulan', price: 'Rp XX.XXX' },
      { label: '1 Tahun', price: 'Rp XX.XXX' },
    ],
  },
  {
    id: 'capcut-pro',
    name: 'CapCut Pro',
    category: 'editing',
    iconUrl: 'assets/images/apps/capcut.webp',
    description: 'Edit video dengan efek premium dan tanpa watermark.',
    badge: 'HOT',
    active: true,
    packages: [
      { label: '1 Bulan', price: 'Rp XX.XXX' },
      { label: '3 Bulan', price: 'Rp XX.XXX' },
    ],
  },
  {
    id: 'faceapp-pro',
    name: 'FaceApp Pro',
    category: 'editing',
    iconUrl: 'assets/images/apps/faceapp.webp',
    description: 'Filter wajah & efek AI premium.',
    badge: '',
    active: true,
    packages: [{ label: '1 Bulan', price: 'Rp XX.XXX' }],
  },
  {
    id: 'picsart-premium',
    name: 'PicsArt Premium',
    category: 'editing',
    iconUrl: 'assets/images/apps/picsart.webp',
    description: 'Edit foto lengkap dengan stiker & tools premium.',
    badge: '',
    active: true,
    packages: [
      { label: '1 Bulan', price: 'Rp XX.XXX' },
      { label: '1 Tahun', price: 'Rp XX.XXX' },
    ],
  },
  {
    id: 'adobe-lightroom-premium',
    name: 'Adobe Lightroom Premium',
    category: 'editing',
    iconUrl: 'assets/images/apps/lightroom.webp',
    description: 'Preset & tools editing warna profesional.',
    badge: '',
    active: true,
    packages: [{ label: '1 Bulan', price: 'Rp XX.XXX' }],
  },
  {
    id: 'vsco-membership',
    name: 'VSCO Membership',
    category: 'editing',
    iconUrl: 'assets/images/apps/vsco.webp',
    description: 'Filter estetik dan tools editing foto premium.',
    badge: '',
    active: true,
    packages: [{ label: '1 Bulan', price: 'Rp XX.XXX' }],
  },
  {
    id: 'remini-premium',
    name: 'Remini Premium',
    category: 'editing',
    iconUrl: 'assets/images/apps/remini.webp',
    description: 'Perbaiki & tingkatkan kualitas foto lama/blur.',
    badge: '',
    active: true,
    packages: [{ label: '1 Bulan', price: 'Rp XX.XXX' }],
  },
  {
    id: 'vn-editor-pro',
    name: 'VN Editor Pro',
    category: 'editing',
    iconUrl: 'assets/images/apps/vn.webp',
    description: 'Aplikasi edit video ringan dengan fitur pro.',
    badge: '',
    active: true,
    packages: [{ label: '1 Bulan', price: 'Rp XX.XXX' }],
  },
  {
    id: 'spotify-premium',
    name: 'Spotify Premium',
    category: 'listening',
    iconUrl: 'assets/images/apps/spotify.webp',
    description: 'Dengarkan musik tanpa iklan, bisa download offline.',
    badge: 'TERLARIS',
    active: true,
    packages: [
      { label: 'Sharing - 1 Bulan', price: 'Rp XX.XXX' },
      { label: 'Sharing - 3 Bulan', price: 'Rp XX.XXX' },
      { label: 'Full Garansi - 1 Bulan', price: 'Rp XX.XXX' },
    ],
  },
  {
    id: 'apple-music',
    name: 'Apple Music',
    category: 'listening',
    iconUrl: 'assets/images/apps/apple-music.webp',
    description: 'Streaming musik kualitas tinggi dari Apple.',
    badge: '',
    active: true,
    packages: [
      { label: 'Sharing - 1 Bulan', price: 'Rp XX.XXX' },
      { label: 'Full Garansi - 1 Bulan', price: 'Rp XX.XXX' },
    ],
  },
  {
    id: 'quizlet-plus',
    name: 'Quizlet Plus',
    category: 'study',
    iconUrl: 'assets/images/apps/quizlet.webp',
    description: 'Flashcard & latihan soal untuk belajar lebih efektif.',
    badge: '',
    active: true,
    packages: [{ label: '1 Bulan', price: 'Rp XX.XXX' }],
  },
  {
    id: 'brainly-plus',
    name: 'Brainly Plus',
    category: 'study',
    iconUrl: 'assets/images/apps/brainly.webp',
    description: 'Bantuan jawaban & pembahasan tugas sekolah.',
    badge: '',
    active: true,
    packages: [{ label: '1 Bulan', price: 'Rp XX.XXX' }],
  },
  {
    id: 'camscanner-premium',
    name: 'CamScanner Premium',
    category: 'study',
    iconUrl: 'assets/images/apps/camscanner.webp',
    description: 'Scan dokumen & tugas jadi PDF tanpa watermark.',
    badge: '',
    active: true,
    packages: [{ label: '1 Bulan', price: 'Rp XX.XXX' }],
  },
  {
    id: 'getcontact-premium',
    name: 'GetContact Premium',
    category: 'lainnya',
    iconUrl: 'assets/images/apps/getcontact.webp',
    description: 'Cek identitas nomor tak dikenal & anti-spam.',
    badge: '',
    active: true,
    packages: [{ label: '1 Bulan', price: 'Rp XX.XXX' }],
  },
  {
    id: 'wattpad-premium',
    name: 'Wattpad Premium',
    category: 'lainnya',
    iconUrl: 'assets/images/apps/wattpad.webp',
    description: 'Baca cerita tanpa iklan dan akses fitur premium.',
    badge: '',
    active: true,
    packages: [{ label: '1 Bulan', price: 'Rp XX.XXX' }],
  },
  {
    id: 'vpn-premium',
    name: 'VPN Premium',
    category: 'lainnya',
    iconUrl: 'assets/images/apps/vpn.webp',
    description: 'Koneksi internet lebih aman dan stabil.',
    badge: '',
    active: true,
    packages: [{ label: '1 Bulan', price: 'Rp XX.XXX' }],
  },
  {
    id: 'mobile-legends',
    name: 'Mobile Legends',
    category: 'topup',
    iconUrl: 'assets/images/apps/mobile-legends.webp',
    description: 'Top up diamond ML, proses cepat & aman.',
    badge: 'TERLARIS',
    active: true,
    packages: [
      { label: '86 Diamond', price: 'Rp XX.XXX' },
      { label: '172 Diamond', price: 'Rp XX.XXX' },
      { label: '257 Diamond', price: 'Rp XX.XXX' },
      { label: 'Weekly Diamond Pass', price: 'Rp XX.XXX' },
    ],
  },
  {
    id: 'free-fire',
    name: 'Free Fire',
    category: 'topup',
    iconUrl: 'assets/images/apps/free-fire.webp',
    description: 'Top up diamond FF, langsung masuk ke akun.',
    badge: 'HOT',
    active: true,
    packages: [
      { label: '70 Diamond', price: 'Rp XX.XXX' },
      { label: '140 Diamond', price: 'Rp XX.XXX' },
      { label: '355 Diamond', price: 'Rp XX.XXX' },
    ],
  },
  {
    id: 'pubg-mobile',
    name: 'PUBG Mobile',
    category: 'topup',
    iconUrl: 'assets/images/apps/pubg-mobile.webp',
    description: 'Top up UC PUBG Mobile resmi & terpercaya.',
    badge: '',
    active: true,
    packages: [
      { label: '60 UC', price: 'Rp XX.XXX' },
      { label: '325 UC', price: 'Rp XX.XXX' },
      { label: '660 UC', price: 'Rp XX.XXX' },
    ],
  },
  {
    id: 'roblox',
    name: 'Roblox',
    category: 'topup',
    iconUrl: 'assets/images/apps/roblox.webp',
    description: 'Top up Robux untuk semua kebutuhan game Roblox-mu.',
    badge: '',
    active: true,
    packages: [
      { label: '80 Robux', price: 'Rp XX.XXX' },
      { label: '400 Robux', price: 'Rp XX.XXX' },
      { label: '800 Robux', price: 'Rp XX.XXX' },
    ],
  },
];
