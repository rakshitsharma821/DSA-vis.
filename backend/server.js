import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleChatRequest } from './api/chatHandler.js';
import { handleAuthRequest } from './api/authHandler.js';
import { handleContestRequest } from './api/contestHandler.js';
import { initMongo } from './api/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env or main.env securely
const candidateEnvFiles = [
  path.join(__dirname, '.env'),
  path.join(__dirname, 'main.env'),
  path.join(__dirname, '..', '.env'),
  path.join(__dirname, '..', 'main.env'),
];

for (const envPath of candidateEnvFiles) {
  try {
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [k, ...v] = trimmed.split('=');
          if (k && v && !process.env[k.trim()]) {
            process.env[k.trim()] = v.join('=').trim().replace(/(^"|"$)/g, '');
          }
        }
      });
    }
  } catch (e) {
    // Ignore read errors
  }
}

const PORT = parseInt(process.env.PORT || process.env.BACKEND_PORT || '3001', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

function getAvailablePort(portToTry) {
  return new Promise((resolve) => {
    const tester = http.createServer();
    tester.once('error', () => resolve(portToTry + 1));
    tester.once('listening', () => {
      tester.close(() => resolve(portToTry));
    });
    tester.listen(portToTry, '127.0.0.1');
  });
}

// Security Headers & CORS origin validator
export function applySecurityHeaders(req, res) {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Clickjacking protection
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  // Legacy XSS protection filter
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Permissions Policy
  res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https://generativelanguage.googleapis.com https://api.openai.com https://api.groq.com https://api.x.ai; frame-ancestors 'none';"
  );

  // CORS Origin Whitelist Verification
  const origin = req.headers.origin;
  const defaultAllowed = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ];

  const envOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const allowedOrigins = [...defaultAllowed, ...envOrigins];

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  } else if (!origin && NODE_ENV === 'development') {
    // Same-origin or non-browser tools in dev
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

const server = http.createServer((req, res) => {
  // Apply standard security headers to every response
  applySecurityHeaders(req, res);

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // 1. Authentication Endpoints
  if (req.url?.startsWith('/api/auth')) {
    return handleAuthRequest(req, res);
  }

  // 2. Contest & Admin Analytics Endpoints
  if (req.url?.startsWith('/api/contests') || req.url?.startsWith('/api/admin')) {
    return handleContestRequest(req, res);
  }

  // 3. Chat & Problem Solver Endpoints
  if (req.url?.startsWith('/api/chat')) {
    return handleChatRequest(req, res);
  }

  // 3. Static File Serving with Strict Path Traversal Protection
  let distDir = path.join(__dirname, 'dist');
  if (!fs.existsSync(distDir)) {
    distDir = path.join(__dirname, '..', 'frontend', 'dist');
  }
  const safeDistDir = path.resolve(distDir);

  let rawReqPath = req.url ? req.url.split('?')[0] : '/';
  if (rawReqPath === '/') rawReqPath = '/index.html';

  let sanitizedReqPath = '/index.html';
  try {
    sanitizedReqPath = path.normalize(decodeURIComponent(rawReqPath)).replace(/\0/g, '');
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Bad Request');
    return;
  }

  // Prohibit attempts to escape to sensitive files (.env, data, history, node_modules)
  const decodedRaw = decodeURIComponent(rawReqPath);
  if (
    decodedRaw.includes('..') ||
    sanitizedReqPath.includes('..') ||
    sanitizedReqPath.toLowerCase().includes('.env') ||
    sanitizedReqPath.toLowerCase().includes('auth_store') ||
    sanitizedReqPath.toLowerCase().includes('data/') ||
    sanitizedReqPath.toLowerCase().includes('node_modules')
  ) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Access Denied');
    return;
  }

  const filePath = path.resolve(safeDistDir, '.' + sanitizedReqPath);

  // Strict check: resolved filePath MUST start with safeDistDir
  if (!filePath.startsWith(safeDistDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Access Denied: Path Traversal Prohibited.');
    return;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.svg': 'image/svg+xml',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.ico': 'image/x-icon',
    };
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    // Single Page App fallback
    const indexPath = path.join(safeDistDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(indexPath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('AlgoViz server is running. Build frontend with `npm run build` to serve production assets.');
    }
  }
});

const isMainModule = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isMainModule) {
  const startServer = async () => {
    const resolvedPort = await getAvailablePort(PORT);
    server.listen(resolvedPort, async () => {
      console.log(`[AlgoViz Secure Server] Running at http://localhost:${resolvedPort} in ${NODE_ENV} mode`);
      await initMongo();
    });
  };
  startServer();
}

export { server };
