// 本地预览 dist/，按 Cloudflare Pages 的方式解析地址：
// /a 依次尝试 a、a.html、a/index.html；找不到时返回最近一级目录的 404.html。
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../dist', import.meta.url))
const port = Number(process.env.PORT) || 4173
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
}

async function isFile(file) {
  try {
    return (await stat(file)).isFile()
  } catch {
    return false
  }
}

async function resolve(pathname) {
  const base = join(root, normalize(pathname))
  if (base !== root && !base.startsWith(root + sep)) return null
  const candidates = pathname.endsWith('/') ? [join(base, 'index.html')] : [base, `${base}.html`, join(base, 'index.html')]
  for (const file of candidates) if (await isFile(file)) return file
  return null
}

async function notFound(pathname) {
  const parts = pathname.split('/').filter(Boolean)
  for (let i = parts.length; i >= 0; i--) {
    const file = join(root, ...parts.slice(0, i), '404.html')
    if (await isFile(file)) return file
  }
  return null
}

createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost')
  const decoded = decodeURIComponent(pathname)
  let file = await resolve(decoded)
  let status = 200
  if (!file) {
    file = await notFound(decoded)
    status = 404
  }
  if (!file) {
    res.writeHead(404).end('Not Found')
    return
  }
  res.writeHead(status, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' })
  res.end(await readFile(file))
}).listen(port, () => console.log(`预览地址：http://localhost:${port}/`))
