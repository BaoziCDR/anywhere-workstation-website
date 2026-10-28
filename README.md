# AnyWhere WorkStation 网站

AnyWhere WorkStation 的对外网站：官网宣传页在根路径，使用手册在 `/docs/`，合并构建后部署到 Cloudflare Pages。产品代码和内部开发文档在 AnyWhere-WorkStation 仓库。

## 目录

| 路径 | 内容 | 访问地址 |
| --- | --- | --- |
| `site/` | 官网静态页面（原生 HTML/CSS/JS，中英双语） | `/`、`/pricing`、`/download`、`/faq` |
| `docs/` | 使用手册（[VitePress](https://vitepress.dev)） | `/docs/` |
| `scripts/build.mjs` | 合并构建：手册输出到 `dist/docs/`，再把 `site/` 复制到 `dist/` | |
| `scripts/preview.mjs` | 按 Cloudflare Pages 的地址规则本地预览 `dist/` | |

## 常用命令

```sh
npm ci
npm run dev       # 只开发手册，热更新
npm run build     # 合并构建到 dist/
npm run preview   # 预览 dist/，默认 http://localhost:4173/，PORT 可改端口
```

官网是纯静态文件，没有构建步骤；改完后用 `npm run build && npm run preview` 查看效果。

## 官网（site/）

- 每段文案中英两份并列（`lang="zh-CN"` / `lang="en"`），`assets/js/site.js` 按 `?lang=`、上次选择、浏览器语言切换。
- 页内链接用相对路径；`404.html` 可能出现在任意子路径下，所以用根绝对路径。
- Logo 和 favicon 使用软件图标（同 AnyWhere-WorkStation 仓库 `apps/desktop/src-tauri/icons/icon.svg`）。
- Sora 标题字体站内托管在 `assets/fonts/`（来自 `@fontsource-variable/sora` 5.3.0，SIL OFL 1.1，见 `OFL.txt`），不依赖 Google Fonts。
- 页头导航和页脚“帮助”中有“使用手册”入口，指向 `docs/`。
- `site/` 下不能建 `docs/` 目录，会和手册输出冲突，构建脚本会报错。

## 使用手册（docs/）

| 路径 | 内容 |
| --- | --- |
| `docs/guide/`、`features/`、`maintenance/`、`faq.md` | 手册正文 |
| `docs/.vitepress/config.mts` | 标题、导航、侧边栏、搜索；`base: '/docs/'` |
| `docs/.vitepress/theme/` | 主题扩展：品牌色、推广卡片、回官网链接 |
| `docs/public/promos/` | 推广数据与图片 |

新增页面后在 `config.mts` 的 `sidebar` 中登记。

- **链接**：手册内链接按正常路径写（如 `/features/files`），VitePress 会自动加 `/docs/` 前缀。`head` 里的地址不会自动加，需要写完整的 `/docs/...`。
- **回官网**：导航里的“官网”是 `SiteLink` 组件。普通导航链接会被加上 `/docs/` 前缀，也会被手册路由拦截，所以单独实现。
- **搜索**：使用 VitePress 本地搜索。中文按相邻两字切分（二元组），构建索引和浏览器查询的切分结果一致。不要改用 `Intl.Segmenter`：Node 和浏览器的分词词典不同，会导致搜不到。

### 推广位

`PromoCard` 挂在默认主题的两个插槽上：

- `aside-ads-before`：宽屏（≥1280px）右侧大纲下方；
- `doc-footer-before`：右侧栏隐藏时（窄屏、手机）显示在正文末尾。

推广内容来自 `docs/public/promos/promos.json`（线上地址 `/docs/promos/promos.json`），每条字段如下：

| 字段 | 说明 |
| --- | --- |
| `id` | 唯一标识，作为外链的 `utm_campaign` |
| `title`、`description`、`cta` | 标题、说明、按钮文案 |
| `image` | 可选，站内路径（自动加 `/docs/` 前缀）或完整 URL，建议 2:1 |
| `link` | 跳转地址；站外链接自动追加 `utm_source=manual`、`utm_medium=<位置>` |
| `placements` | 可选，`["aside"]`、`["footer"]`；省略表示两处都投放 |
| `weight` | 可选，随机展示权重，默认 1 |

推广数据只在浏览器端加载，加载失败时不显示推广位，不影响正文。构建时设置 `VITE_PROMO_URL` 可改为读取外部地址（如 R2），之后更换推广内容不用重新部署；外部地址需要允许本站跨域读取（CORS）。

## 部署到 Cloudflare Pages

在 Cloudflare 控制台创建 Pages 项目并关联本仓库：

| 设置 | 值 |
| --- | --- |
| 生产分支 | `main` |
| 根目录 | 留空（仓库根目录） |
| 构建命令 | `npm ci && npm run build` |
| 输出目录 | `dist` |
| 环境变量 | `NODE_VERSION=24`；可选 `VITE_PROMO_URL` |

`site/_headers` 设置缓存：官网资源文件名不带哈希，缓存 1 小时；手册构建产物带哈希，长期缓存；推广数据缓存 5 分钟。Cloudflare 会合并同时匹配的多条规则，新增规则时注意不要和已有路径重叠。

根路径的 `404.html` 不能删：根目录没有 404.html 时，Cloudflare Pages 会按单页应用处理，所有不存在的地址都返回首页。手册有自己的 `/docs/404.html`。
