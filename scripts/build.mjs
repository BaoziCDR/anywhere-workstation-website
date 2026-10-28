// 合并构建：手册（VitePress）输出到 dist/docs/，官网静态页面复制到 dist/ 根目录。
import { cpSync, existsSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { build } from 'vitepress'

const path = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url))
const dist = path('dist')

rmSync(dist, { recursive: true, force: true })
await build(path('docs'))
if (existsSync(path('site/docs'))) throw new Error('site/docs 与手册输出目录冲突')
cpSync(path('site'), dist, { recursive: true })
console.log(`官网与手册已输出到 ${dist}`)
