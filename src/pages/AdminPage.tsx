import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { PresetIcon, Product, ProductCategory, ProductPackage } from '../types/product';
import {
  CATEGORY_MAP,
  productHasPackages,
  resolveAssetUrl,
} from '../constants/storeConfig';
import { useStore } from '../context/StoreContext';

type IconTabKey = 'uploadTab' | 'presetTab' | 'urlTab';
type CategoryFilter = 'all' | ProductCategory;

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

interface DeleteTarget {
  id: string;
  name: string;
}

const ADMIN_CATEGORY_TABS: Array<{ key: CategoryFilter; label: string }> = [
  { key: 'all', label: 'Semua Produk' },
  { key: 'streaming', label: '📺 Streaming' },
  { key: 'editing', label: '🎬 Editing' },
  { key: 'listening', label: '🎵 Musik' },
  { key: 'study', label: '📚 Edukasi' },
  { key: 'topup', label: '🎮 Game Top Up' },
  { key: 'lainnya', label: '📦 Lainnya / VPN' },
];

const DEFAULT_PACKAGE_ROWS: ProductPackage[] = [
  { label: 'Sharing', price: 'Rp 15.000' },
  { label: 'Private', price: 'Rp 35.000' },
];

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshProducts } = useStore();

  const [adminToken, setAdminToken] = useState<string>(() => {
    try {
      return sessionStorage.getItem('terranova_admin_token') || '';
    } catch {
      return '';
    }
  });

  // Auth Gate state
  const [pinInput, setPinInput] = useState<string>('');
  const [loginFeedback, setLoginFeedback] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Dashboard catalog state
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [presetIcons, setPresetIcons] = useState<PresetIcon[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProductId, setEditingProductId] = useState<string>('');
  const [formCategory, setFormCategory] = useState<ProductCategory>('streaming');
  const [formName, setFormName] = useState<string>('');
  const [formBadge, setFormBadge] = useState<string>('');
  const [formActive, setFormActive] = useState<boolean>(true);
  const [formDesc, setFormDesc] = useState<string>('');
  const [activeIconTab, setActiveIconTab] = useState<IconTabKey>('uploadTab');
  const [selectedIconPath, setSelectedIconPath] = useState<string>(
    'assets/images/apps/netflix.webp'
  );
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [iconPreviewOverride, setIconPreviewOverride] = useState<string>('');
  const [hasPackages, setHasPackages] = useState<boolean>(false);
  const [singlePrice, setSinglePrice] = useState<string>('Rp 25.000');
  const [packageRows, setPackageRows] = useState<ProductPackage[]>(DEFAULT_PACKAGE_ROWS);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Delete confirmation modal state (replaces window.confirm)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Toast state (replaces window.alert)
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    document.title = 'Admin Portal | Terranova Store';
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 3400);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const handleSessionExpired = useCallback(() => {
    setAdminToken('');
    try {
      sessionStorage.removeItem('terranova_admin_token');
    } catch {
      // Ignore storage error
    }
    setIsModalOpen(false);
    setDeleteTarget(null);
    setLoginFeedback({
      message: 'Sesi admin telah berakhir. Silakan masukkan PIN kembali.',
      type: 'error',
    });
  }, []);

  const fetchAdminProducts = useCallback(async () => {
    try {
      const res = await fetch(`/api/products?all=true&t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (!res.ok) return;
      const data = (await res.json()) as { success?: boolean; products?: Product[] };
      if (data.success && Array.isArray(data.products)) {
        setProductsList(data.products);
      }
    } catch {
      showToast('Gagal memuat daftar produk dari server.', 'error');
    }
  }, [showToast]);

  const loadPresetIcons = useCallback(async () => {
    try {
      const res = await fetch('/api/icons');
      if (!res.ok) return;
      const data = (await res.json()) as { success?: boolean; icons?: PresetIcon[] };
      if (data.success && Array.isArray(data.icons)) {
        setPresetIcons(data.icons);
      }
    } catch {
      // Preset icons are optional convenience
    }
  }, []);

  useEffect(() => {
    void loadPresetIcons();
  }, [loadPresetIcons]);

  useEffect(() => {
    if (adminToken) {
      void fetchAdminProducts();
    }
  }, [adminToken, fetchAdminProducts]);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (deleteTarget) {
          setDeleteTarget(null);
        } else if (isModalOpen) {
          setIsModalOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteTarget, isModalOpen]);

  const markNavigatedBack = () => {
    try {
      sessionStorage.setItem('terranova_navigated_back', 'true');
    } catch {
      // Ignore storage error
    }
  };

  // 1. Login Submit
  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const pin = pinInput.trim();
    if (!pin || isLoggingIn) return;

    setIsLoggingIn(true);
    setLoginFeedback(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        token?: string;
        message?: string;
      };

      if (data.success && data.token) {
        const newToken = data.token;
        setLoginFeedback({
          message: data.message || 'Login Admin Berhasil',
          type: 'success',
        });
        try {
          sessionStorage.setItem('terranova_admin_token', newToken);
        } catch {
          // Ignore storage error
        }
        window.setTimeout(() => {
          setAdminToken(newToken);
          setPinInput('');
          setLoginFeedback(null);
        }, 350);
      } else {
        setLoginFeedback({
          message: data.message || 'PIN Admin Salah',
          type: 'error',
        });
      }
    } catch {
      setLoginFeedback({
        message: 'Gagal menghubungi server.',
        type: 'error',
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  // 2. Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
    } catch {
      // Ignore network error during logout
    }
    setAdminToken('');
    try {
      sessionStorage.removeItem('terranova_admin_token');
    } catch {
      // Ignore storage error
    }
    markNavigatedBack();
    navigate('/');
  };

  // Computed Stats
  const stats = useMemo(() => {
    const total = productsList.length;
    const activeCount = productsList.filter((p) => p.active !== false).length;
    const categoryCount = new Set(productsList.map((p) => p.category)).size;
    const totalPackages = productsList.reduce(
      (acc, p) => acc + (Array.isArray(p.packages) ? p.packages.length : 0),
      0
    );
    return { total, activeCount, categoryCount, totalPackages };
  }, [productsList]);

  // Filtered Admin Products
  const filteredProducts = useMemo(() => {
    let list = productsList;
    if (categoryFilter !== 'all') {
      list = list.filter((p) => p.category === categoryFilter);
    }
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.badge && p.badge.toLowerCase().includes(q))
      );
    }
    return list;
  }, [productsList, categoryFilter, searchQuery]);

  // Toggle Product Visibility
  const handleToggleProduct = async (productId: string) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status === 401) {
        handleSessionExpired();
        return;
      }
      const data = (await res.json()) as {
        success?: boolean;
        active?: boolean;
        message?: string;
      };
      if (data.success) {
        setProductsList((prev) =>
          prev.map((item) =>
            item.id === productId ? { ...item, active: Boolean(data.active) } : item
          )
        );
        await refreshProducts();
        showToast(data.message || 'Status produk diperbarui.', 'success');
      } else {
        showToast(data.message || 'Gagal mengubah status produk.', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan koneksi ke server.', 'error');
    }
  };

  // Confirm Delete Product
  const handleConfirmDelete = async () => {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status === 401) {
        handleSessionExpired();
        return;
      }
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (data.success) {
        setProductsList((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        setDeleteTarget(null);
        await refreshProducts();
        showToast(data.message || 'Produk berhasil dihapus.', 'success');
      } else {
        showToast(data.message || 'Gagal menghapus produk.', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan koneksi saat menghapus produk.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Open Add Product Modal
  const openAddProductModal = () => {
    setEditingProductId('');
    setFormCategory('streaming');
    setFormName('');
    setFormBadge('');
    setFormActive(true);
    setFormDesc('');
    setActiveIconTab('uploadTab');
    setSelectedIconPath('assets/images/apps/netflix.webp');
    setCustomUrlInput('');
    setIconPreviewOverride('');
    setHasPackages(false);
    setSinglePrice('Rp 25.000');
    setPackageRows([
      { label: 'Sharing', price: 'Rp 15.000' },
      { label: 'Private', price: 'Rp 35.000' },
    ]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsModalOpen(true);
  };

  // Open Edit Product Modal
  const openEditProductModal = (product: Product) => {
    setEditingProductId(product.id);
    setFormCategory(product.category);
    setFormName(product.name);
    setFormBadge(product.badge || '');
    setFormActive(product.active !== false);
    setFormDesc(product.description || '');
    setActiveIconTab('uploadTab');
    const iconPath = product.iconUrl || 'assets/images/apps/netflix.webp';
    setSelectedIconPath(iconPath);
    setCustomUrlInput(iconPath);
    setIconPreviewOverride('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    const hasPkg = productHasPackages(product);
    setHasPackages(hasPkg);
    if (hasPkg) {
      setSinglePrice(
        product.price ||
          (product.packages && product.packages[0]
            ? product.packages[0].price
            : 'Rp 25.000')
      );
      setPackageRows(
        Array.isArray(product.packages) && product.packages.length > 0
          ? product.packages.map((pkg) => ({ label: pkg.label, price: pkg.price }))
          : [...DEFAULT_PACKAGE_ROWS]
      );
    } else {
      setSinglePrice(
        product.price ||
          (product.packages && product.packages[0]
            ? product.packages[0].price
            : 'Rp XX.XXX')
      );
      setPackageRows(
        Array.isArray(product.packages) && product.packages.length > 0
          ? product.packages.map((pkg) => ({ label: pkg.label, price: pkg.price }))
          : [...DEFAULT_PACKAGE_ROWS]
      );
    }

    setIsModalOpen(true);
  };

  // Toggle HasPackages Checkbox
  const handleToggleHasPackages = (checked: boolean) => {
    setHasPackages(checked);
    if (checked && packageRows.length === 0) {
      setPackageRows([
        { label: 'Sharing', price: 'Rp 15.000' },
        { label: 'Private', price: 'Rp 35.000' },
      ]);
    }
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = typeof event.target?.result === 'string' ? event.target.result : '';
      if (!base64Data) return;

      setIconPreviewOverride(base64Data);

      try {
        const res = await fetch('/api/admin/upload-icon', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            base64Data,
            filename: file.name,
            appName: formName || 'app-icon',
          }),
        });
        if (res.status === 401) {
          handleSessionExpired();
          return;
        }
        const data = (await res.json()) as {
          success?: boolean;
          iconUrl?: string;
          message?: string;
        };
        if (data.success && data.iconUrl) {
          setSelectedIconPath(data.iconUrl);
          setCustomUrlInput(data.iconUrl);
          setIconPreviewOverride('');
          showToast('Ikon berhasil diunggah.', 'success');
        } else {
          showToast(data.message || 'Gagal mengunggah gambar ikon.', 'error');
        }
      } catch {
        showToast('Terjadi kesalahan saat mengunggah gambar ikon.', 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSaving) return;

    const trimmedName = formName.trim();
    const trimmedDesc = formDesc.trim();
    if (!trimmedName || !trimmedDesc) {
      showToast('Nama produk dan deskripsi wajib diisi.', 'error');
      return;
    }

    const cleanedPackages: ProductPackage[] = [];
    let directPrice = singlePrice.trim() || 'Rp XX.XXX';

    if (hasPackages) {
      packageRows.forEach((row) => {
        const lbl = row.label.trim();
        const prc = row.price.trim();
        if (lbl || prc) {
          cleanedPackages.push({
            label: lbl || 'Varian',
            price: prc || 'Rp XX.XXX',
          });
        }
      });

      if (cleanedPackages.length === 0) {
        showToast(
          'Anda mengaktifkan opsi paket, silakan klik "+ Tambah Paket" atau matikan centang "Ada Paket".',
          'error'
        );
        return;
      }
      directPrice = cleanedPackages[0].price;
    }

    const payload = {
      name: trimmedName,
      category: formCategory,
      badge: formBadge.trim(),
      description: trimmedDesc,
      iconUrl: selectedIconPath,
      hasPackages,
      price: directPrice,
      packages: cleanedPackages,
      active: formActive,
    };

    setIsSaving(true);
    try {
      const endpoint = editingProductId
        ? `/api/admin/products/${editingProductId}`
        : '/api/admin/products';
      const method = editingProductId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        handleSessionExpired();
        return;
      }

      const data = (await res.json()) as { success?: boolean; message?: string };
      if (data.success) {
        setIsModalOpen(false);
        await fetchAdminProducts();
        await refreshProducts();
        showToast(
          data.message ||
            (editingProductId ? 'Produk berhasil diperbarui.' : 'Produk baru berhasil ditambahkan.'),
          'success'
        );
      } else {
        showToast(data.message || 'Gagal menyimpan produk.', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan saat menyimpan produk.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const previewImageSrc = iconPreviewOverride || resolveAssetUrl(selectedIconPath, formName);

  return (
    <div className="admin-body">
      {/* ================= 1. LOGIN GATE (PIN KEAMANAN) ================= */}
      {!adminToken ? (
        <section className="admin-auth-wrap" id="authGate">
          <div className="admin-auth-card">
            <div className="admin-auth-icon">🔒</div>
            <h1 className="admin-auth-title">PORTAL ADMIN</h1>
            <p className="admin-auth-desc">
              Masuk untuk mengunggah, mengedit, dan mengelola katalog aplikasi &amp; top up game di
              Terranova Store.
            </p>

            <form id="loginForm" onSubmit={handleLoginSubmit}>
              <div className="admin-input-group">
                <label className="admin-label" htmlFor="adminPin">
                  PIN Keamanan Admin
                </label>
                <input
                  type="password"
                  id="adminPin"
                  className="admin-input"
                  placeholder="Masukkan PIN Admin"
                  autoComplete="current-password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                id="loginBtn"
                disabled={isLoggingIn}
              >
                <span>{isLoggingIn ? 'MEMVERIFIKASI...' : 'MASUK DASHBOARD'}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>

              {loginFeedback && (
                <div className={`admin-feedback-banner ${loginFeedback.type}`}>
                  {loginFeedback.message}
                </div>
              )}
            </form>

            <Link
              to="/"
              className="admin-auth-back"
              id="btnBackToStore"
              onClick={markNavigatedBack}
            >
              ← Kembali ke Halaman Utama Toko
            </Link>
          </div>
        </section>
      ) : (
        /* ================= 2. DASHBOARD MANAGEMENT ================= */
        <main className="dashboard-panel active" id="dashboardPanel">
          <div className="admin-container">
            {/* Topbar Header */}
            <header className="admin-topbar">
              <div className="admin-brand">
                <div className="admin-brand-icon">⚡</div>
                <div className="admin-brand-text">
                  <h1>TERRANOVA ADMIN</h1>
                  <p>Manajemen Katalog Aplikasi &amp; Top Up Game</p>
                </div>
              </div>

              <div className="admin-topbar-actions">
                <span className="admin-badge-status">
                  <span className="status-dot"></span>
                  Server Terhubung
                </span>
                <Link
                  to="/"
                  className="admin-btn admin-btn-secondary admin-topbar-btn"
                  id="btnViewStore"
                  onClick={markNavigatedBack}
                >
                  🛍️ Lihat Toko
                </Link>
                <button
                  type="button"
                  className="admin-btn admin-btn-danger admin-topbar-btn"
                  id="btnLogout"
                  onClick={handleLogout}
                >
                  🚪 Keluar
                </button>
              </div>
            </header>

            {/* Stats Metrics */}
            <section className="admin-stats-grid">
              <div className="stat-card">
                <div className="stat-card-title">Total Produk</div>
                <div className="stat-card-value" id="statTotalProducts">
                  {stats.total}
                </div>
                <div className="stat-card-sub">Di seluruh kategori katalog</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-title">Produk Aktif</div>
                <div className="stat-card-value text-green-400" id="statActiveProducts">
                  {stats.activeCount}
                </div>
                <div className="stat-card-sub">Ditampilkan di live storefront</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-title">Kategori Katalog</div>
                <div className="stat-card-value text-sky-400" id="statCategories">
                  {stats.categoryCount}
                </div>
                <div className="stat-card-sub">Streaming, Edit, Musik, Edukasi, Game, dll.</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-title">Total Pilihan Paket</div>
                <div className="stat-card-value text-pink-400" id="statTotalPackages">
                  {stats.totalPackages}
                </div>
                <div className="stat-card-sub">Opsi durasi &amp; nominal harga</div>
              </div>
            </section>

            {/* Action Controls */}
            <section className="admin-controls-bar">
              <div className="controls-row-top">
                <div className="search-input-wrap">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input
                    type="text"
                    id="adminSearchInput"
                    className="admin-input"
                    placeholder="Cari produk berdasarkan nama, badge, atau deskripsi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  className="admin-btn admin-btn-primary admin-add-btn"
                  id="btnOpenAddProduct"
                  onClick={openAddProductModal}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  TAMBAH PRODUK BARU
                </button>
              </div>

              {/* Filter Kategori Tabs */}
              <div className="category-tabs" id="adminCategoryTabs">
                {ADMIN_CATEGORY_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    className={`cat-tab-btn ${categoryFilter === tab.key ? 'active' : ''}`}
                    onClick={() => setCategoryFilter(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Products Grid */}
            <section className="admin-products-grid" id="adminProductsContainer">
              {filteredProducts.length === 0 ? (
                <div className="admin-empty-state">
                  <div className="text-3xl mb-2">🔍</div>
                  <div className="text-lg font-bold text-white">Tidak ada produk yang sesuai</div>
                  <div className="text-slate-400 text-sm mt-1">
                    Coba ubah kata kunci pencarian atau filter kategori Anda.
                  </div>
                </div>
              ) : (
                filteredProducts.map((product) => {
                  const catMeta = CATEGORY_MAP[product.category];
                  const hasPkg = productHasPackages(product);
                  const singleDisplayPrice =
                    product.price ||
                    (product.packages && product.packages[0]
                      ? product.packages[0].price
                      : 'Rp XX.XXX');

                  return (
                    <div
                      key={product.id}
                      className={`admin-prod-card ${product.active === false ? 'inactive' : ''}`}
                    >
                      <div>
                        <div className="admin-prod-top">
                          <div className="admin-prod-icon">
                            <img
                              src={resolveAssetUrl(product.iconUrl, product.name)}
                              alt={product.name}
                              onError={(e) => {
                                const target = e.currentTarget;
                                if (target.src !== `${window.location.origin}/assets/images/apps/netflix.webp`) {
                                  target.src = '/assets/images/apps/netflix.webp';
                                }
                              }}
                            />
                          </div>
                          <div className="admin-prod-meta">
                            <h3 className="admin-prod-name" title={product.name}>
                              {product.name}
                            </h3>
                            <div className="admin-prod-badges">
                              <span className="badge-cat">
                                {catMeta ? catMeta.adminLabel : product.category}
                              </span>
                              {product.badge && (
                                <span className="badge-custom">{product.badge}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <p className="admin-prod-desc">
                          {product.description || 'Tidak ada deskripsi.'}
                        </p>

                        <div className="admin-packages-summary">
                          {hasPkg && Array.isArray(product.packages) && product.packages.length > 0 ? (
                            product.packages.map((pkg, idx) => (
                              <div key={`${pkg.label}-${idx}`} className="admin-package-item">
                                <span className="pkg-lbl">{pkg.label}</span>
                                <span className="pkg-prc">{pkg.price}</span>
                              </div>
                            ))
                          ) : (
                            <div className="admin-package-item admin-single-price-item">
                              <span className="pkg-lbl text-slate-400">Harga Produk:</span>
                              <span className="pkg-prc text-cyan-400 font-bold">
                                {singleDisplayPrice}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="admin-prod-actions">
                        <button
                          type="button"
                          className="admin-act-btn act-btn-edit"
                          onClick={() => openEditProductModal(product)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          className="admin-act-btn act-btn-toggle"
                          onClick={() => handleToggleProduct(product.id)}
                        >
                          {product.active === false ? '👁️ Tampilkan' : '🚫 Sembunyikan'}
                        </button>
                        <button
                          type="button"
                          className="admin-act-btn act-btn-del"
                          title="Hapus Produk"
                          onClick={() =>
                            setDeleteTarget({ id: product.id, name: product.name })
                          }
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </section>
          </div>
        </main>
      )}

      {/* ================= 3. MODAL TAMBAH / EDIT PRODUK ================= */}
      <div
        className={`admin-modal-backdrop ${isModalOpen ? 'active' : ''}`}
        id="productModal"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setIsModalOpen(false);
          }
        }}
      >
        <div className="admin-modal">
          <div className="admin-modal-header">
            <h2 className="admin-modal-title" id="modalFormTitle">
              {editingProductId
                ? `EDIT PRODUK: ${formName.toUpperCase()}`
                : 'TAMBAH PRODUK BARU'}
            </h2>
            <button
              type="button"
              className="modal-close-btn"
              id="btnCloseProductModal"
              onClick={() => setIsModalOpen(false)}
              aria-label="Tutup modal"
            >
              &times;
            </button>
          </div>

          <form id="productForm" onSubmit={handleSaveProduct}>
            <div className="form-grid-2">
              {/* Kategori */}
              <div className="admin-input-group">
                <label className="admin-label" htmlFor="prodCategory">
                  Kategori *
                </label>
                <select
                  id="prodCategory"
                  className="admin-input"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as ProductCategory)}
                  required
                >
                  <option value="streaming">📺 APK Streaming</option>
                  <option value="editing">🎬 APK Editing</option>
                  <option value="listening">🎵 APK Listening / Musik</option>
                  <option value="study">📚 APK Study / Edukasi</option>
                  <option value="topup">🎮 Top Up Game</option>
                  <option value="lainnya">📦 APK Lainnya / Tools</option>
                </select>
              </div>

              {/* Nama Produk */}
              <div className="admin-input-group">
                <label className="admin-label" htmlFor="prodName">
                  Nama Produk / Game *
                </label>
                <input
                  type="text"
                  id="prodName"
                  className="admin-input"
                  placeholder="Contoh: Disney+ Hotstar"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-grid-2">
              {/* Badge Promo / Label */}
              <div className="admin-input-group">
                <label className="admin-label" htmlFor="prodBadge">
                  Badge Label (Opsional)
                </label>
                <input
                  type="text"
                  id="prodBadge"
                  className="admin-input"
                  placeholder="Contoh: TERLARIS, HOT, PROMO, NEW"
                  value={formBadge}
                  onChange={(e) => setFormBadge(e.target.value)}
                />
              </div>

              {/* Status Aktif */}
              <div className="admin-input-group">
                <label className="admin-label" htmlFor="prodActive">
                  Status Tampil
                </label>
                <select
                  id="prodActive"
                  className="admin-input"
                  value={formActive ? 'true' : 'false'}
                  onChange={(e) => setFormActive(e.target.value === 'true')}
                >
                  <option value="true">🟢 Tampilkan di Toko (Aktif)</option>
                  <option value="false">⚪ Sembunyikan (Nonaktif)</option>
                </select>
              </div>
            </div>

            {/* Deskripsi */}
            <div className="admin-input-group">
              <label className="admin-label" htmlFor="prodDesc">
                Deskripsi Singkat *
              </label>
              <textarea
                id="prodDesc"
                className="admin-input"
                rows={2}
                placeholder="Jelaskan fitur utama atau keunggulan produk..."
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                required
              ></textarea>
            </div>

            {/* Pemilihan Ikon Aplikasi */}
            <div className="admin-input-group">
              <label className="admin-label">Ikon Aplikasi / Game *</label>

              <div className="icon-tabs">
                <button
                  type="button"
                  className={`icon-tab-btn ${activeIconTab === 'uploadTab' ? 'active' : ''}`}
                  onClick={() => setActiveIconTab('uploadTab')}
                >
                  Upload Gambar
                </button>
                <button
                  type="button"
                  className={`icon-tab-btn ${activeIconTab === 'presetTab' ? 'active' : ''}`}
                  onClick={() => setActiveIconTab('presetTab')}
                >
                  Pilih Ikon Bawaan
                </button>
                <button
                  type="button"
                  className={`icon-tab-btn ${activeIconTab === 'urlTab' ? 'active' : ''}`}
                  onClick={() => setActiveIconTab('urlTab')}
                >
                  Link URL Gambar
                </button>
              </div>

              {/* Tab 1: Upload File */}
              <div
                className={`icon-tab-content ${activeIconTab === 'uploadTab' ? 'active' : ''}`}
                id="uploadTab"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  id="iconFileInput"
                  className="admin-input"
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  onChange={handleFileUpload}
                />
                <small className="text-slate-500 text-xs block mt-1">
                  Pilih file gambar logo (PNG, JPG, WebP). Akan otomatis disesuaikan secara rapi.
                </small>
              </div>

              {/* Tab 2: Preset Icons */}
              <div
                className={`icon-tab-content ${activeIconTab === 'presetTab' ? 'active' : ''}`}
                id="presetTab"
              >
                <div className="preset-icons-grid" id="presetIconsGrid">
                  {presetIcons.map((ic) => {
                    const isSelected =
                      selectedIconPath === ic.path || `/${selectedIconPath}` === `/${ic.path}`;
                    return (
                      <div
                        key={ic.filename}
                        className={`preset-icon-choice ${isSelected ? 'selected' : ''}`}
                        title={ic.name}
                        onClick={() => {
                          setSelectedIconPath(ic.path);
                          setCustomUrlInput(ic.path);
                          setIconPreviewOverride('');
                        }}
                      >
                        <img
                          src={resolveAssetUrl(ic.path)}
                          alt={ic.name}
                          loading="lazy"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tab 3: Custom URL */}
              <div
                className={`icon-tab-content ${activeIconTab === 'urlTab' ? 'active' : ''}`}
                id="urlTab"
              >
                <input
                  type="text"
                  id="iconUrlInput"
                  className="admin-input"
                  placeholder="assets/images/apps/netflix.webp atau URL https://..."
                  value={customUrlInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomUrlInput(val);
                    if (val.trim()) {
                      setSelectedIconPath(val.trim());
                      setIconPreviewOverride('');
                    }
                  }}
                />
              </div>

              {/* Preview Ikon */}
              <div className="icon-preview-box">
                <div className="preview-img-wrap">
                  <img
                    id="iconPreviewImg"
                    src={previewImageSrc}
                    alt="Preview Ikon"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src !== `${window.location.origin}/assets/images/apps/netflix.webp`) {
                        target.src = '/assets/images/apps/netflix.webp';
                      }
                    }}
                  />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Tampilan Ikon di Kartu</div>
                  <div id="iconPreviewPath" className="text-xs text-slate-400 break-all">
                    {selectedIconPath}
                  </div>
                </div>
              </div>
            </div>

            {/* Pilihan Paket (Opsional) & Harga */}
            <div className="admin-input-group admin-pkg-config-box">
              <div className="flex justify-between items-center mb-3 gap-3">
                <div>
                  <label className="admin-label mb-0.5">Sistem Paket / Varian (Opsional)</label>
                  <div className="text-xs text-slate-400">
                    Centang jika produk punya opsi seperti Sharing/Private, durasi, dll. Jika tidak
                    dicentang, produk memakai harga tunggal.
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap select-none">
                  <input
                    type="checkbox"
                    id="toggleHasPackages"
                    className="w-4 h-4 cursor-pointer accent-cyan-400"
                    checked={hasPackages}
                    onChange={(e) => handleToggleHasPackages(e.target.checked)}
                  />
                  <span className="text-xs font-bold text-cyan-400">Ada Paket</span>
                </label>
              </div>

              {/* Opsi 1: Harga Tunggal */}
              {!hasPackages ? (
                <div id="singlePriceGroup">
                  <label className="admin-label" htmlFor="prodSinglePrice">
                    Harga Produk *
                  </label>
                  <input
                    type="text"
                    id="prodSinglePrice"
                    className="admin-input"
                    placeholder="Contoh: Rp 25.000 atau Rp XX.XXX"
                    value={singlePrice}
                    onChange={(e) => setSinglePrice(e.target.value)}
                  />
                </div>
              ) : (
                /* Opsi 2: Daftar Paket & Harga Dinamis */
                <div id="multiPackageGroup">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-300">
                      Daftar Varian / Paket:
                    </span>
                    <button
                      type="button"
                      id="btnAddPackageRow"
                      className="admin-btn admin-btn-secondary admin-add-pkg-btn"
                      onClick={() =>
                        setPackageRows((prev) => [...prev, { label: '', price: 'Rp ' }])
                      }
                    >
                      + Tambah Paket
                    </button>
                  </div>

                  <div className="package-builder-list" id="packageBuilderList">
                    {packageRows.map((row, idx) => (
                      <div key={idx} className="pkg-builder-row">
                        <input
                          type="text"
                          className="admin-input pkg-label-input"
                          placeholder="Varian / Paket (misal: Sharing, Private, 1 Bulan)"
                          value={row.label}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPackageRows((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, label: val } : item))
                            );
                          }}
                        />
                        <input
                          type="text"
                          className="admin-input pkg-price-input"
                          placeholder="Harga (misal: Rp 15.000)"
                          value={row.price}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPackageRows((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, price: val } : item))
                            );
                          }}
                        />
                        <button
                          type="button"
                          className="pkg-row-del"
                          title="Hapus Paket"
                          onClick={() =>
                            setPackageRows((prev) => prev.filter((_, i) => i !== idx))
                          }
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="modal-actions">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                id="btnCancelProductModal"
                onClick={() => setIsModalOpen(false)}
              >
                Batal
              </button>
              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                id="btnSaveProduct"
                disabled={isSaving}
              >
                {isSaving ? 'MENYIMPAN...' : 'SIMPAN KE KATALOG'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ================= 4. DELETE CONFIRMATION MODAL ================= */}
      <div
        className={`admin-modal-backdrop ${deleteTarget ? 'active' : ''}`}
        onClick={(e) => {
          if (e.target === e.currentTarget && !isDeleting) {
            setDeleteTarget(null);
          }
        }}
      >
        <div className="admin-modal admin-confirm-modal">
          <div className="admin-modal-header">
            <h2 className="admin-modal-title">HAPUS PRODUK</h2>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
              aria-label="Tutup konfirmasi"
            >
              &times;
            </button>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            Apakah Anda yakin ingin menghapus produk{' '}
            <strong className="text-white">&ldquo;{deleteTarget?.name}&rdquo;</strong> dari katalog
            Terranova Store?
          </p>

          <div className="modal-actions">
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Batal
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-danger"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'MENGHAPUS...' : '🗑️ Ya, Hapus'}
            </button>
          </div>
        </div>
      </div>

      {/* ================= 5. IN-UI TOAST NOTIFICATION ================= */}
      {toast && (
        <div className={`admin-toast ${toast.type}`} role="status" aria-live="polite">
          <span>{toast.type === 'success' ? '✅' : '⚠️'}</span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};
