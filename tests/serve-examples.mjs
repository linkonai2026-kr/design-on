import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const host = '127.0.0.1';
const manualPort = 4173;
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

export function startExampleServer({ port = 0 } = {}) {
  const server = createServer((request, response) => {
    const urlPath = decodeURIComponent(new URL(request.url, `http://${host}`).pathname);
    const relativePath = urlPath === '/' ? 'examples/cafe/index.html' : urlPath.slice(1);
    let target = path.resolve(root, relativePath);

    if (!target.startsWith(root + path.sep) || !existsSync(target)) {
      response.writeHead(404).end('Not found');
      return;
    }

    if (statSync(target).isDirectory()) {
      target = path.join(target, 'index.html');
    }

    response.writeHead(200, {
      'Cache-Control': 'no-store',
      'Content-Type': contentTypes[path.extname(target).toLowerCase()] || 'application/octet-stream'
    });
    createReadStream(target).pipe(response);
  });

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => {
      server.off('error', reject);
      resolve(server);
    });
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = await startExampleServer({ port: manualPort });
  console.log(`design-on examples: http://${host}:${manualPort}`);
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => server.close(() => process.exit(0)));
  }
}
