import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { parseArgs } from 'node:util';
import { extname, resolve, sep } from 'node:path';

const { values } = parseArgs({
  options: {
    host: { type: 'string', default: '127.0.0.1' },
    port: { type: 'string', default: process.env.PORT || '4173' },
    strictPort: { type: 'boolean' },
  },
});
const root = resolve('dist');
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
};

createServer(async (req, res) => {
  try {
    const { pathname, search } = new URL(req.url, 'http://localhost');
    let file = resolve(root, '.' + decodeURIComponent(pathname));
    if (file !== root && !file.startsWith(root + sep)) {
      res.writeHead(404).end();
      return;
    }
    if ((await stat(file)).isDirectory()) {
      if (!pathname.endsWith('/')) {
        res.writeHead(308, { Location: pathname + '/' + search }).end();
        return;
      }
      file = resolve(file, 'index.html');
      await stat(file);
    }
    res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'text/plain; charset=utf-8' });
    if (req.method === 'HEAD') res.end();
    else createReadStream(file).pipe(res);
  } catch {
    res.writeHead(404, { 'Content-Type': mime['.html'] });
    createReadStream(resolve(root, '404.html')).pipe(res);
  }
}).listen(Number(values.port), values.host, () => {
  console.log(`Portfolio preview at http://${values.host}:${values.port}/`);
});
