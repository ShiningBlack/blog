---
title: 重建 ShiningBlack 个人博客：零维护 Git-CMS 架构实践
description: 使用 Astro + Sveltia CMS + Giscus + Vercel 构建零数据库、零运维成本的个人博客，并实现 /admin 可视化后台在线发帖。
pubDate: 2026-11-25 10:00:00
updatedDate: ''
category: 工程实践
tags:
  - Astro
  - Vercel
  - Sveltia CMS
  - 博客折腾
cover: ''
pinned: true
draft: true
---

欢迎来到全新重建的 **ShiningBlack** 个人博客！

在重构这套博客时，我只设定了一个核心原则：**省心、零维护成本**——不需要维护服务器、不需要管理数据库、不需要担心免费数据库休眠或备份丢失，所有文章、图片与配置全部以纯文本形式安全保存在 GitHub 仓库中。

## 整体技术架构

| 模块 | 选型方案 | 特点 |
| --- | --- | --- |
| 静态站点框架 | Astro + Tailwind CSS | 零前端冗余 JS，极速加载，原生支持 Shiki 代码高亮 |
| 可视化后台 | Sveltia CMS (`/admin`) | 支持在线撰写 Markdown、拖拽上传图片、草稿开关 |
| 后台鉴权 | Vercel Serverless (`/api/auth`) | 内置 GitHub OAuth 代理，无需额外挂 Cloudflare Worker |
| 评论系统 | Giscus | 基于 GitHub Discussions，零数据库、亮暗主题同步 |
| 全文搜索 | Pagefind | 构建期生成静态搜索索引，`Ctrl / Cmd + K` 毫秒检索 |

## 如何使用后台发帖

1. 打开 `https://www.shiningblack.xyz/admin/`。
2. 点击 **Sign in with GitHub** 完成授权登录（也支持直接粘贴 GitHub PAT 或在 Chrome 中直连本地文件夹）。
3. 点击左侧 **博客文章 -> 新建文章**，填写标题、摘要、标签，在 Markdown 编辑器中输入正文并拖拽上传图片。
4. 点击右上角 **Publish**，Sveltia CMS 会自动提交一次 Commit 到 GitHub `main` 分支，约 30 秒后 Vercel 自动完成构建上线。

## 代码高亮示例

```ts
// api/auth.ts - 内置 OAuth 授权跳转示例
export function getRedirectUri(host: string): string {
  return `https://${host}/api/callback`;
}
```

> 提示：如果在写作时不想立刻公开文章，可以打开后台的 **草稿 (不公开)** 开关；正式构建时会自动过滤草稿文章。

欢迎在下方评论区留言测试！
