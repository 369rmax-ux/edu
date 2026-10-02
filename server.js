import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, relative, resolve, isAbsolute } from 'node:path';

const root = resolve(import.meta.dirname);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png' };
const port = Number(process.env.PORT || 4173);
createServer(async (request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
  catch { response.writeHead(400); response.end('Bad request'); return; }
  const file = join(root, pathname === '/' ? 'index.html' : pathname);
  const inside = relative(root, file);
  if (inside.startsWith('..') || isAbsolute(inside) || !types[extname(file)]) { response.writeHead(404); response.end('Not found'); return; }
  try { response.writeHead(200, { 'Content-Type': types[extname(file)], 'Cache-Control': 'no-cache' }); response.end(await readFile(file)); }
  catch { response.writeHead(404); response.end('Not found'); }
}).listen(port, () => console.log(`EduGod at http://localhost:${port}`));
