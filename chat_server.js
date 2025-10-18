const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const TheStellarcDynamic = require('./the_stellarc_dynamic');

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const orchestrator = new TheStellarcDynamic();

function send(res, status, body, headers = {}) {
  const data = typeof body === 'string' ? body : JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json', ...headers });
  res.end(data);
}

function serveStatic(req, res) {
  const parsed = url.parse(req.url);
  let pathname = parsed.pathname || '/';
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.join(PUBLIC_DIR, path.normalize(pathname));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403); res.end('Forbidden'); return true;
  }
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const type = ext === '.html' ? 'text/html' : ext === '.js' ? 'application/javascript' : ext === '.css' ? 'text/css' : 'text/plain';
    res.writeHead(200, { 'Content-Type': type });
    fs.createReadStream(filePath).pipe(res);
    return true;
  }
  return false;
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  if (req.method === 'GET') {
    if (serveStatic(req, res)) return;
    res.writeHead(404); res.end('Not Found'); return;
  }

  if (req.method === 'POST' && parsed.pathname === '/api/directive') {
    try {
      let body = '';
      req.on('data', chunk => { body += chunk; if (body.length > 1e6) req.socket.destroy(); });
      req.on('end', async () => {
        let payload = {};
        try { payload = JSON.parse(body || '{}'); } catch {}
        const text = String(payload.text || '').trim();
        if (!text) return send(res, 400, { error: 'text is required' });
        try {
          const result = await orchestrator.executeDirective(text);
          send(res, 200, result);
        } catch (e) {
          send(res, 500, { error: 'execution_failed', message: String(e && e.message || e) });
        }
      });
    } catch (e) {
      send(res, 500, { error: 'server_error', message: String(e && e.message || e) });
    }
    return;
  }

  res.writeHead(405); res.end('Method Not Allowed');
});

server.listen(PORT, () => {
  console.log(`[chat-ui] Listening on http://localhost:${PORT}`);
  console.log(`[chat-ui] Open in a browser to chat with the orchestrator.`);
});
