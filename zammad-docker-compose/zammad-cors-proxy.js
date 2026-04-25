/**
 * Zammad CORS Proxy
 * ─────────────────
 * Runs locally on http://localhost:3100
 * Forwards all /api/v1/* requests to your Zammad instance,
 * injecting CORS headers so the browser doesn't block them.
 *
 * Usage:
 *   1. npm install http-proxy-middleware express cors
 *   2. Set ZAMMAD_URL in your environment (or edit the default below)
 *   3. node zammad-cors-proxy.js
 *   4. In the AI Agent, set URL to: http://localhost:3100
 */

const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const ZAMMAD_URL = process.env.ZAMMAD_URL || 'http://localhost:8080';
const PORT = process.env.PORT || 3100;

const app = express();

// ── CORS: allow all origins (restrict in production) ──────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false,
}));

// ── Handle preflight OPTIONS requests ─────────────────────────────────────────


// ── Proxy /api/v1/* → Zammad ──────────────────────────────────────────────────
app.use('/api/v1', createProxyMiddleware({
  target: ZAMMAD_URL,
  changeOrigin: true,
  secure: true,               // set false if your Zammad uses a self-signed cert
  pathRewrite: { '^': '/api/v1' },
  on: {
    proxyReq: (proxyReq, req) => {
      // Forward Authorization header as-is (Token token=xxx)
      if (req.headers.authorization) {
        proxyReq.setHeader('Authorization', req.headers.authorization);
      }
      console.log(`[proxy] ${req.method} ${ZAMMAD_URL}/api/v1${req.path}`);
    },
    error: (err, req, res) => {
      console.error('[proxy error]', err.message);
      res.status(502).json({ error: 'Proxy error', detail: err.message });
    },
  },
}));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok', target: ZAMMAD_URL }));

app.listen(PORT, () => {
  console.log(`\nZammad CORS Proxy running on http://localhost:${PORT}`);
  console.log(`Forwarding to: ${ZAMMAD_URL}\n`);
});
