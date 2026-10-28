import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ProductPackage {
  label: string;
  price: string;
}

interface StoredProduct {
  id: string;
  name: string;
  category: string;
  description: string;
  badge: string;
  iconUrl: string;
  hasPackages?: boolean;
  price?: string;
  packages: ProductPackage[];
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface AdminConfig {
  pin: string;
  updatedAt?: string;
}

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const CONFIG_FILE = path.join(DATA_DIR, 'admin-config.json');
const ASSETS_DIR = path.join(__dirname, 'assets');
const UPLOAD_DIR = path.join(ASSETS_DIR, 'images', 'custom');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Serve static image/video assets in both dev and production
app.use('/assets', express.static(ASSETS_DIR));

const activeAdminTokens = new Set<string>();

function getProducts(): StoredProduct[] {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const raw = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
      return JSON.parse(raw) as StoredProduct[];
    }
  } catch (err) {
    console.error('Error reading products.json:', err);
  }
  return [];
}

function saveProducts(products: StoredProduct[]): void {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
}

function getAdminConfig(): AdminConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8')) as AdminConfig;
    }
  } catch (err) {
    console.error('Error reading admin-config.json:', err);
  }
  return { pin: '317444' };
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (token && activeAdminTokens.has(token)) {
    next();
    return;
  }
  res.status(401).json({ success: false, message: 'Akses ditolak. Sesi admin tidak valid atau telah berakhir.' });
}

// ==================== PUBLIC API ROUTES ====================

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).send('OK');
});

app.get('/api/products', (req: Request, res: Response) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store',
  });
  try {
    const all = req.query.all === 'true';
    const products = getProducts();
    if (all) {
      res.json({ success: true, count: products.length, products });
    } else {
      const activeOnly = products.filter((p) => p.active !== false);
      res.json({ success: true, count: activeOnly.length, products: activeOnly });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memuat produk', error: String(error) });
  }
});

app.get('/api/icons', (_req: Request, res: Response) => {
  try {
    const appsDir = path.join(ASSETS_DIR, 'images', 'apps');
    let icons: Array<{ filename: string; path: string; name: string }> = [];
    if (fs.existsSync(appsDir)) {
      const files = fs.readdirSync(appsDir);
      icons = files
        .filter((f) => f.endsWith('.webp') || f.endsWith('.png') || f.endsWith('.svg'))
        .map((f) => ({
          filename: f,
          path: `assets/images/apps/${f}`,
          name: f.replace(/\.(webp|png|svg)$/i, '').replace(/-/g, ' ').toUpperCase(),
        }));
    }
    res.json({ success: true, icons });
  } catch {
    res.status(500).json({ success: false, icons: [] });
  }
});

// ==================== ADMIN API ROUTES ====================

app.post('/api/admin/login', (req: Request, res: Response) => {
  const pin = typeof req.body?.pin === 'string' ? req.body.pin : '';
  const config = getAdminConfig();

  if (!pin) {
    res.status(400).json({ success: false, message: 'PIN admin wajib diisi' });
    return;
  }

  if (pin.trim() === '317444' || pin.trim() === config.pin.trim()) {
    const token = crypto.randomBytes(32).toString('hex');
    activeAdminTokens.add(token);
    res.json({
      success: true,
      token,
      message: 'Login berhasil! Selamat datang di Portal Admin Terranova Store.',
    });
    return;
  }

  res.status(401).json({ success: false, message: 'PIN admin salah. Silakan coba lagi.' });
});

app.post('/api/admin/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (token) activeAdminTokens.delete(token);
  res.json({ success: true, message: 'Logout berhasil' });
});

app.post('/api/admin/change-pin', requireAdmin, (_req: Request, res: Response) => {
  res.status(403).json({
    success: false,
    message: 'PIN admin telah ditetapkan secara permanen (317444) dan tidak dapat diubah.',
  });
});

app.post('/api/admin/upload-icon', requireAdmin, (req: Request, res: Response) => {
  try {
    const { base64Data, filename, appName } = req.body as {
      base64Data?: string;
      filename?: string;
      appName?: string;
    };
    if (!base64Data) {
      res.status(400).json({ success: false, message: 'Data gambar tidak ditemukan' });
      return;
    }

    const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      res.status(400).json({ success: false, message: 'Format base64 tidak valid' });
      return;
    }

    const mime = matches[1];
    const ext = mime.includes('png')
      ? 'png'
      : mime.includes('webp')
        ? 'webp'
        : mime.includes('svg')
          ? 'svg'
          : 'jpg';
    const buffer = Buffer.from(matches[2], 'base64');

    const cleanName = (appName || filename || 'custom-app')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');
    const finalFilename = `${cleanName}-${Date.now()}.${ext}`;
    const targetPath = path.join(UPLOAD_DIR, finalFilename);

    fs.writeFileSync(targetPath, buffer);
    const publicUrl = `assets/images/custom/${finalFilename}`;

    res.json({
      success: true,
      message: 'Ikon berhasil diunggah',
      iconUrl: publicUrl,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengunggah ikon', error: String(error) });
  }
});

const VALID_CATEGORIES = ['streaming', 'editing', 'listening', 'study', 'lainnya', 'topup'];

app.post('/api/admin/products', requireAdmin, (req: Request, res: Response) => {
  try {
    const { name, category, description, badge, iconUrl, packages, active, hasPackages, price } = req.body as {
      name?: string;
      category?: string;
      description?: string;
      badge?: string;
      iconUrl?: string;
      packages?: ProductPackage[];
      active?: boolean;
      hasPackages?: boolean;
      price?: string;
    };

    if (!name || !name.trim()) {
      res.status(400).json({ success: false, message: 'Nama produk wajib diisi' });
      return;
    }
    if (!category || !VALID_CATEGORIES.includes(category)) {
      res.status(400).json({ success: false, message: 'Kategori produk tidak valid' });
      return;
    }

    const hasPkg = hasPackages !== undefined ? Boolean(hasPackages) : Array.isArray(packages) && packages.length > 0;
    const validPackages: ProductPackage[] =
      hasPkg && Array.isArray(packages) && packages.length > 0
        ? packages
            .map((pkg) => ({
              label: (pkg.label || '').trim(),
              price: (pkg.price || 'Rp XX.XXX').trim(),
            }))
            .filter((pkg) => pkg.label || pkg.price)
        : [];
    const directPrice = (price || (validPackages[0] ? validPackages[0].price : 'Rp XX.XXX')).trim();

    const baseId = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');
    const id = `${baseId}-${Date.now().toString(36)}`;

    const newProduct: StoredProduct = {
      id,
      name: name.trim(),
      category,
      description: (description || '').trim(),
      badge: (badge || '').trim(),
      iconUrl: (iconUrl || 'assets/images/apps/netflix.webp').trim(),
      hasPackages: validPackages.length > 0,
      price: directPrice,
      packages: validPackages,
      active: active !== false,
      createdAt: new Date().toISOString(),
    };

    const products = getProducts();
    products.unshift(newProduct);
    saveProducts(products);

    res.status(201).json({
      success: true,
      message: `Produk "${name}" berhasil ditambahkan ke katalog ${category.toUpperCase()}!`,
      product: newProduct,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menambah produk', error: String(error) });
  }
});

app.put('/api/admin/products/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { name, category, description, badge, iconUrl, packages, active, hasPackages, price } = req.body as {
      name?: string;
      category?: string;
      description?: string;
      badge?: string;
      iconUrl?: string;
      packages?: ProductPackage[];
      active?: boolean;
      hasPackages?: boolean;
      price?: string;
    };

    const products = getProducts();
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
      return;
    }

    const current = products[index];

    const hasPkg =
      hasPackages !== undefined
        ? Boolean(hasPackages)
        : Array.isArray(packages)
          ? packages.length > 0
          : current.hasPackages ?? (current.packages && current.packages.length > 0);

    let validPackages: ProductPackage[] = current.packages || [];
    if (packages !== undefined) {
      validPackages =
        hasPkg && Array.isArray(packages) && packages.length > 0
          ? packages
              .map((pkg) => ({
                label: (pkg.label || '').trim(),
                price: (pkg.price || 'Rp XX.XXX').trim(),
              }))
              .filter((pkg) => pkg.label || pkg.price)
          : [];
    }

    const directPrice =
      price !== undefined
        ? price.trim()
        : validPackages.length > 0
          ? validPackages[0].price
          : current.price || 'Rp XX.XXX';

    const updated: StoredProduct = {
      ...current,
      name: name !== undefined ? name.trim() : current.name,
      category: category !== undefined ? category : current.category,
      description: description !== undefined ? description.trim() : current.description,
      badge: badge !== undefined ? badge.trim() : current.badge,
      iconUrl: iconUrl !== undefined ? iconUrl.trim() : current.iconUrl,
      hasPackages: validPackages.length > 0,
      price: directPrice,
      packages: validPackages,
      active: active !== undefined ? active : current.active,
      updatedAt: new Date().toISOString(),
    };

    products[index] = updated;
    saveProducts(products);

    res.json({
      success: true,
      message: `Produk "${updated.name}" berhasil diperbarui!`,
      product: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui produk', error: String(error) });
  }
});

app.patch('/api/admin/products/:id/toggle', requireAdmin, (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const products = getProducts();
    const product = products.find((p) => p.id === id);

    if (!product) {
      res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
      return;
    }

    product.active = !product.active;
    product.updatedAt = new Date().toISOString();
    saveProducts(products);

    res.json({
      success: true,
      message: `Status produk "${product.name}" diubah menjadi ${product.active ? 'Aktif' : 'Nonaktif'}`,
      active: product.active,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengubah status produk', error: String(error) });
  }
});

app.delete('/api/admin/products/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const products = getProducts();
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
      return;
    }

    const deleted = products.splice(index, 1)[0];
    saveProducts(products);

    res.json({
      success: true,
      message: `Produk "${deleted.name}" berhasil dihapus dari katalog!`,
      deletedId: id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menghapus produk', error: String(error) });
  }
});

// ==================== VITE DEV MIDDLEWARE / PRODUCTION DIST ====================

async function startServer(): Promise<void> {
  const distDir = path.join(__dirname, 'dist');
  const isProd =
    process.env.NODE_ENV === 'production' ||
    process.env.npm_lifecycle_event === 'start' ||
    (process.env.npm_lifecycle_event !== 'dev' && fs.existsSync(path.join(distDir, 'index.html')));

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Terranova Store server running on http://0.0.0.0:${PORT}`);
  });

  const shutdown = (signal: string) => {
    console.log(`${signal} signal received: closing HTTP server`);
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
