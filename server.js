import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

const root = resolve(import.meta.dirname);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml' };
const port = Number(process.env.PORT || 4173);
createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  const file = join(root, pathname === '/' ? 'index.html' : decodeURIComponent(pathname));
  if (!file.startsWith(root) || !types[extname(file)]) { response.writeHead(404); response.end('Not found'); return; }
  try { response.writeHead(200, { 'Content-Type': types[extname(file)], 'Cache-Control': 'no-cache' }); response.end(await readFile(file)); }
  catch { response.writeHead(404); response.end('Not found'); }
}).listen(port, () => console.log(`EduGod at http://localhost:${port}`));
