const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const filename = path.resolve(__dirname, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
  if (!filename.startsWith(__dirname + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(filename, (error, bytes) => { if (error) { res.writeHead(404).end(); return; } res.setHeader('Content-Type', types[path.extname(filename)] || 'application/octet-stream'); res.end(bytes); });
}).listen(4173, '127.0.0.1', () => console.log('Move Strong preview: http://127.0.0.1:4173'));
