# Terranova Store

Katalog online aplikasi premium dan top up game dengan alur pemesanan langsung via WhatsApp serta Portal Admin terintegrasi. Aplikasi ini dibangun menggunakan **React**, **TypeScript**, **Vite**, **Tailwind CSS**, dan **Express**.

## Fitur Utama

- **Animasi Pembuka Kosmik**: Intro sinematik peluncuran roket dan tipografi kinetik `TERRANOVA STORE` dengan tombol lewati (`Lewati Intro` / `Esc`) serta deteksi navigasi kembali otomatis.
- **Katalog & Pencarian Real-Time**: Pencarian instan dengan *skeleton loading*, filter pil kategori cepat, serta halaman khusus untuk tiap kategori (`Streaming`, `Editing`, `Listening`, `Study`, `Lainnya`, `Top Up Game`).
- **Ringkasan Pricelist Interaktif**: Daftar harga terstruktur per kategori yang langsung membuka modal pemesanan saat diklik.
- **Modal Pemesanan WhatsApp**: Pemilihan varian/paket dinamis atau harga tunggal, metode pembayaran QRIS, kolom catatan opsional, dan pembuatan tautan `wa.me` otomatis.
- **Portal Admin (`/admin`)**: Autentikasi PIN keamanan, statistik katalog *real-time*, tambah/edit/hapus produk, *toggle* visibilitas produk aktif/nonaktif, pemilih ikon 3 mode (unggah gambar, ikon bawaan, atau URL), dan pengaturan paket dinamis.

## Struktur Proyek

```text
├── assets/                  # Aset gambar statis & ikon resmi aplikasi (.webp)
├── data/                    # Penyimpanan JSON persisten (products.json, admin-config.json)
├── src/
│   ├── components/          # Komponen UI modular (Navbar, Sidebar, Modal, Kartu Produk, Intro, Galaxy)
│   ├── constants/           # Konfigurasi kontak toko, pemetaan kategori, dan utilitas harga/WhatsApp
│   ├── context/             # React Context untuk sinkronisasi katalog & state modal
│   ├── pages/               # Halaman SPA (HomePage, CategoryPage, PricelistPage, AdminPage)
│   ├── styles/              # Stylesheet tema kosmik & Portal Admin
│   ├── types/               # Definisi tipe TypeScript
│   ├── App.tsx              # Konfigurasi React Router & manajemen scroll
│   └── main.tsx             # Entry point aplikasi React
├── index.html               # Entry HTML Vite
├── server.ts                # Server Express (REST API katalog/admin + middleware Vite SPA)
├── tsconfig.json            # Konfigurasi TypeScript
└── vite.config.ts           # Konfigurasi bundler Vite
```

## Menjalankan Aplikasi

1. Instal dependensi:
   ```bash
   npm install
   ```
2. Jalankan server pengembangan (port `3000`):
   ```bash
   npm run dev
   ```
3. Build untuk produksi:
   ```bash
   npm run build
   npm start
   ```
