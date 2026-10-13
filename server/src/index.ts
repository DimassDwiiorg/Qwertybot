import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import fs from 'fs';
import { config } from './config.js';
import { handleChatMessage } from './controllers/chatController.js';
import { getQuota } from './controllers/quotaController.js';
import {
  getSessions,
  getSessionByIdOrCode,
  createNewSession,
  updateSessionTitle,
  deleteSession
} from './controllers/sessionController.js';
import {
  verifyVps,
  getAdminStatus,
  lockAdmin,
  executeAdminCommand
} from './controllers/adminController.js';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

// Security Headers (Helmet) dengan konfigurasi kompatibel untuk Google Sign-In
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'", 'https://accounts.google.com/gsi/client'],
      'frame-src': ['https://accounts.google.com/gsi/'],
      'connect-src': ["'self'", 'https://accounts.google.com/gsi/'],
      'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://accounts.google.com/gsi/style'],
      'font-src': ["'self'", 'https://fonts.gstatic.com'],
      'img-src': ["'self'", 'blob:', 'data:', 'https://*.googleusercontent.com', 'https://*.pollinations.ai', 'https://pollinations.ai'],
      'media-src': ["'self'", 'blob:'],
      'object-src': ["'none'"],
      'frame-ancestors': ["'none'"]
    }
  },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false
}));

// CORS Middleware
app.use(cors());

// Rate Limiting (Mencegah Abuse & Denial-of-Wallet)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Terlalu banyak permintaan API. Silakan coba lagi sebentar.' }
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15, // Maksimal 15 pesan chat per menit per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Terlalu banyak pengiriman pesan. Silakan tunggu 1 menit sebelum mengirim lagi.' }
});

app.use('/api', apiLimiter);

// Body parser limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Whitelist Ekstensi File yang Diizinkan (Mencegah Stored XSS & Eksekusi Skrip)
const ALLOWED_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.webp', '.gif',
  '.webm', '.wav', '.mp3', '.ogg', '.m4a',
  '.pdf', '.txt', '.md', '.csv', '.json',
  '.js', '.ts', '.tsx', '.jsx', '.py', '.c', '.cpp', '.java', '.css'
]);

// Multer storage dengan nama berkas acak kriptografis (CSPRNG UUID)
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(config.uploadDir)) {
      fs.mkdirSync(config.uploadDir, { recursive: true });
    }
    cb(null, config.uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // Maksimal 15MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return cb(new Error(`Tipe berkas ${ext} tidak diizinkan demi keamanan.`));
    }
    cb(null, true);
  }
});

// Static directory untuk uploads dengan proteksi Content-Disposition dan nosniff
app.use('/uploads', express.static(config.uploadDir, {
  dotfiles: 'deny',
  setHeaders: (res, filePath) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const ext = path.extname(filePath).toLowerCase();
    const inlineSafe = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.webm', '.wav', '.mp3', '.ogg', '.m4a'];
    if (!inlineSafe.includes(ext)) {
      res.setHeader('Content-Disposition', 'attachment');
    }
  }
}));

// API Routes
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    botName: 'qwertybot',
    time: new Date().toISOString()
  });
});

// Quota route
app.get('/api/quota', getQuota);

// Admin / VPS Control routes (Khusus Owner 2-Factor Auth)
app.post('/api/admin/verify', verifyVps);
app.get('/api/admin/status', getAdminStatus);
app.post('/api/admin/lock', lockAdmin);
app.post('/api/admin/exec', executeAdminCommand);

// Session routes
app.get('/api/sessions', getSessions);
app.get('/api/sessions/:query', getSessionByIdOrCode);
app.post('/api/sessions/new', createNewSession);
app.put('/api/sessions/:id/title', updateSessionTitle);
app.delete('/api/sessions/:id', deleteSession);

// Chat route dengan proteksi rate limit dan upload filter
app.post('/api/chat', chatLimiter, (req, res, next) => {
  upload.array('files', 5)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: err.message || 'Gagal memproses berkas upload.' });
    }
    next();
  });
}, handleChatMessage);

// Serve frontend build dynamically
const clientDistPath = path.resolve(process.cwd(), 'client', 'dist');

// SEO endpoints with explicit MIME types
app.get('/robots.txt', (_req, res) => {
  const robotsPath = path.join(clientDistPath, 'robots.txt');
  if (fs.existsSync(robotsPath)) {
    res.type('text/plain').sendFile(robotsPath);
  } else {
    res.type('text/plain').send('User-agent: *\nAllow: /\nSitemap: https://qwertybot.biz.id/sitemap.xml\n');
  }
});

app.get('/sitemap.xml', (_req, res) => {
  const sitemapPath = path.join(clientDistPath, 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    res.type('application/xml').sendFile(sitemapPath);
  } else {
    res.status(404).send('Sitemap not found');
  }
});

// Explicit OpenGraph social card image endpoints
app.get(['/og-image.jpg', '/og-image.png', '/og-banner-hd.jpg', '/og-banner-hd.png'], (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  const filename = path.basename(req.path);
  const imgPath = path.join(clientDistPath, filename);
  if (fs.existsSync(imgPath)) {
    return res.sendFile(imgPath);
  }
  next();
});

app.use(express.static(clientDistPath, {
  setHeaders: (res, filePath) => {
    if (filePath.includes('og-')) {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  }
}));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.send('Frontend sedang dibangun atau buka via Vite di port 5173');
});

// Start server
app.listen(config.port, () => {
  console.log(`🤖 qwertybot backend berjalan di http://localhost:${config.port}`);
});
