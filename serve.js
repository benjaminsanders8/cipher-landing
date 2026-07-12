const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const DIR = __dirname;

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

http.createServer((req, res) => {
  let url = req.url.split('?')[0];
  // mirror production (Vercel) routing: cleanUrls + /about -> /team
  if (url === '/' ) url = '/index.html';
  if (url === '/about' || url === '/about/') { res.writeHead(302, { Location: '/team' }); res.end(); return; }
  if (!path.extname(url) && fs.existsSync(path.join(DIR, url + '.html'))) url += '.html';
  const filePath = path.join(DIR, url);
  const ext = path.extname(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => console.log(`Serving on http://localhost:${PORT}`));
