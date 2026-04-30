#!/usr/bin/env node

/**
 * HTTPS Development Server for Next.js
 * 
 * This script runs Next.js with HTTPS support using self-signed certificates.
 * Required for testing Web Push Notifications in development.
 */

const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

// Check if certificates exist
const certPath = path.join(__dirname, 'certs', 'localhost.pem');
const keyPath = path.join(__dirname, 'certs', 'localhost-key.pem');

if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
  console.error('❌ SSL certificates not found!');
  console.error('');
  console.error('Please run: ./setup-https.sh');
  console.error('');
  process.exit(1);
}

// HTTPS options
const httpsOptions = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
};

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(httpsOptions, async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log('');
      console.log('🔐 HTTPS Development Server');
      console.log('');
      console.log(`✅ Ready on https://${hostname}:${port}`);
      console.log(`✅ Network: https://192.168.x.x:${port}`);
      console.log('');
      console.log('💡 Press Ctrl+C to stop');
      console.log('');
    });
});
