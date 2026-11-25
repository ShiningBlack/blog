# ShiningBlack Blog

基于 **Astro + Tailwind CSS v4 + Sveltia CMS + Giscus + Pagefind** 构建的零数据库、零维护成本个人博客，部署于 Vercel，绑定域名 `www.shiningblack.xyz`。

## 特性

- **纯静态高性能**：Astro 静态输出，自带 Shiki 双主题代码高亮、文章目录 TOC、阅读时长统计、标签归档、RSS (`/rss.xml`) 与 Sitemap。
- **Git-CMS 可视化后台 (`/admin`)**：内置 Sveltia CMS，支持在线发帖、拖拽传图、草稿控制与项目/关于页编辑。
- **零外部依赖 OAuth 代理**：项目自带 Vercel Serverless Functions（`api/auth.ts` 与 `api/callback.ts`），无需额外部署 Cloudflare Worker。
- **零数据库评论系统**：集成 Giscus（基于 GitHub Discussions），自动随站点亮暗主题切换。
- **静态全文搜索**：构建期由 Pagefind 生成索引，支持 `Ctrl / Cmd + K` 快捷键搜索。

---

## 上线配置清单（仅需一次性操作 3 步）

### 1. 在现有 Vercel 项目关联本仓库

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)，进入你当前绑定 `shiningblack.xyz` 的项目。
2. 打开 **Settings -> Git -> Connect Git Repository**，选择 `ShiningBlack/blog`。
3. 确认 Build Command 为 `npm run build`，Output Directory 为 `dist`（Astro 会自动识别）。
4. NameSilo 的 DNS 解析无需做任何修改。

### 2. 配置 GitHub OAuth App（启用 `/admin` 一键登录）

1. 打开 [GitHub Developer Settings -> OAuth Apps -> New OAuth App](https://github.com/settings/developers)。
2. 填写：
   - **Application name**: `ShiningBlack Blog CMS`
   - **Homepage URL**: `https://www.shiningblack.xyz`
   - **Authorization callback URL**: `https://www.shiningblack.xyz/api/callback`
3. 生成 Client Secret 后，在 Vercel 项目 **Settings -> Environment Variables** 中添加：
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
4. 在 Vercel 触发一次 **Redeploy** 后，即可访问 `https://www.shiningblack.xyz/admin/` 使用 GitHub 登录写作。

> 提示：在未配置 OAuth App 前，也可以在 `/admin/` 页面直接使用 GitHub Personal Access Token 或 Chrome 本地文件夹模式编辑文章。

### 3. 授权 Giscus 评论应用

仓库 `ShiningBlack/blog` 已自动开启 **Discussions**，且 `repoId` 与 `Announcements` 分类 ID 已预配置在 [src/config/site.ts](src/config/site.ts) 中。

只需安装 [Giscus GitHub App](https://github.com/apps/giscus) 并授权访问 `ShiningBlack/blog` 仓库即可直接启用评论。

---

## 本地开发

```bash
npm install
npm run dev
```

构建与预览生产版本（包含 Pagefind 搜索索引）：

```bash
npm run build
npm run preview
```
