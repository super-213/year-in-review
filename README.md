# 📅 Year in Review Generator

![Project Status](https://img.shields.io/badge/status-live-success)
![License](https://img.shields.io/badge/license-MIT-blue)
![Tech Stack](https://img.shields.io/badge/stack-React%20%7C%20Tailwind%20%7C%20Vite-blueviolet)

> **Turn your yearly stats and memories into aesthetic, shareable stories.**

A privacy-focused, local-first web application that empowers users to visualize their year (reading stats, fitness goals, coding commits, etc.) in a "Spotify Wrapped" style format. Features 12+ unique visual themes ranging from 8-Bit Retro to Cyberpunk Neon.

🔗 **Live Demo:** [https://year-in-review-jak.vercel.app/](https://year-in-review-jak.vercel.app/)

---

## ✨ Key Features

### 🎨 12+ Visual Themes
Diverse aesthetic engines catering to different user personas, instantly transforming the same data into entirely different vibes:
* **Retro:** 8-Bit console nostalgia.
* **Swiss:** International Typographic Style (Grid systems).
* **Neon:** Cyberpunk/Dark mode aesthetics.
* **Journal:** Hand-drawn, sketchbook vibes.
* **Glass:** Frosted, gradient glassmorphism.
* ... and many more including LoFi, Minimal, Brutalism, Vaporwave, Dark Academia, Pop Art, and Blueprint.

### 📸 Smart Screenshot Mode
Native "Download" buttons often fail on in-app mobile webviews (like clicking a link from Instagram). We implemented a dedicated **"Screenshot Mode"**:
* Toggles a full-screen, clean overlay.
* Hides all UI chrome (buttons, navigation arrows, forms).
* Allows users to take perfect native device screenshots designed for Instagram Stories/TikTok dimensions.

### 🔒 Privacy-First (Local-First)
* **Local editing:** Editing, importing and exporting run in your browser. Optional temporary publishing uploads the selected work and photos to Cloudflare R2 and creates a public link.
* **Persistence:** Data is saved automatically to the browser's `localStorage`, allowing users to return later without losing their progress.

### 🚀 UX & Accessibility
* **Magic Write ("Tulis Ajaib"):** A deterministic algorithm that reads your selected stats and automatically generates personalized, aesthetic summary paragraphs.
* **Internationalization (i18n):** Full localization support for English (`en`) and Indonesian (`id`).
* **Interactive UI:** Features a highly intuitive split-pane architecture with a real-time updating live preview engine and smooth theme transitions.

---

## 🛠️ Tech Stack

* **Frontend Framework:** React 18
* **Styling:** Tailwind CSS 
* **Icons:** Lucide React
* **Building & Bundling:** Vite
* **Deployment:** Vercel

---

## 🚀 Getting Started

Follow these steps to run the project locally.

### Prerequisites
* Node.js 22.12 or higher (required for the included Cloudflare tooling)
* npm, yarn, or pnpm

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/fadlyzaki/year-in-review.git
    cd year-in-review
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or yarn install
    ```

3.  **Start the development server**
    ```bash
    npm run dev
    # or yarn dev
    ```

4.  Open `http://localhost:5173` in your browser.

---

## 📂 Project Architecture

The core logic currently lives within the React components, driven by a configuration-based approach. 

```text
src/
├── YearInReviewGenerator.jsx # Main core application, monolithic logic & views
├── App.jsx                   # Application entry point
├── main.jsx                  # React DOM rendering
└── index.css                 # Global Tailwind styles
```

*(Note: The project aims to eventually transition to a more heavily modularized architecture to separate theme renderers and config data.)*

---

## 📄 Documentation

- **PRD.md**: Contains the comprehensive Product Requirements Document detailing the scope, features, and non-functional requirements of this project.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/fadlyzaki/year-in-review/issues).

## 📝 License
This project is licensed under the MIT License.

## 保存、导入与部署作品

编辑器顶部新增 **导出可部署 HTML** 和 **导入作品**。

1. 编辑内容、上传照片并选择主题，然后点击 **导出可部署 HTML**。
2. 浏览器下载 `index.html`，包含按自选顺序排列的全部页面、主题样式、照片和可继续编辑的数据。
3. 将该文件放到网站的静态目录即可。例如放到 `review/2026/index.html`，通过网站的 `/review/2026/` 访问；无需 npm、构建步骤或后端。也可直接用浏览器打开文件。
4. 访客看到铺满屏幕的只读作品：手机使用浏览器原生横向滑动与整页吸附翻页，不显示翻页按钮（横屏同样如此）；电脑使用左右按钮或键盘方向键翻页。手机竖屏采用全屏竖向布局，电脑及横屏会按可用空间重排统计、回忆与照片；不包含编辑器的手机模拟框，导出页同时去掉内容中的装饰边框和投影。纵向滑动仍用于阅读页内内容，不会误触翻页。
5. 后续修改时，在编辑器点击 **导入作品** 并选择同一个 HTML 文件。导入会替换当前草稿，恢复页面数量、顺序、各页内容、照片、主题和界面语言；修改后重新导出并更新网站上的文件。

本地自动保存也包含主题与语言，界面会显示保存状态。浏览器空间不足时请导出文件备份。

- 上传照片和可下载的外链照片会内嵌在 HTML 中。外链无法读取时会提示具体照片，需改为上传本地图片再导出，避免部署后丢图。
- 支持 PNG、JPEG、GIF、WebP、AVIF、BMP 照片；HTML 作品文件最大 100 MB。
- 在线字体采用非阻塞加载，断网时使用系统备用字体；内容、照片和翻页不依赖编辑器服务器。
- HTML 内的作品数据是公开页面的一部分；导入只解析数据，不执行文件中的 HTML 或脚本。
- `npm run build` 用于构建编辑器。部署单个作品只需上传导出的 `index.html`。

运行 `npm test` 验证作品格式、所有主题的数据往返、非法文件拒绝与照片打包失败处理。

### Core Memories 图片

每条回忆的 Emoji 下方提供「上传图片」。图片会替代 Emoji 显示在全部主题中，支持替换图片，或「移除图片，恢复 Emoji」。原 Emoji 会保留。
图片随浏览器草稿自动保存，并内嵌到导出的 HTML 中，重新导入后仍可编辑。支持 PNG、JPEG、GIF、WebP、AVIF、BMP，单张不超过 10 MB；旧版仅含 Emoji 的作品仍可导入。

### 自由组合页面

在「页面管理」中添加封面、年度数据、高光时刻、照片墙或年度总结，点击页面进入编辑，用上下箭头排序或删除不需要的页面（至少保留一页）。同一种页面可以重复添加，页数不再固定为五页。数据、亮点、照片和总结按页独立编辑；年份、主标题、副标题和风格为作品共用。切换风格保留页面配置。

新草稿及导出文件使用 v2 页面结构。旧浏览器草稿和 v1 HTML 作品仍可读取，并自动恢复为原来的五页顺序。

### 临时部署到当前 Cloudflare 域名

顶部的「临时部署」会复用 HTML 导出功能，将当前作品和照片保存到 R2，生成例如 `https://你的域名/demo/9e489e3f1d384a16a56bc8c374caee38` 的公开链接。无需每次重新构建网站；每次部署生成独立快照和新链接，继续编辑不会修改已发布作品。链接默认 7 天有效，上传上限 20 MB（本地 HTML 导出仍为 100 MB）。部署口令只用于上传，不保存在浏览器草稿里，访客查看无需口令。

**首次配置（Pages / Workers 共用）：**

1. 在 Cloudflare R2 创建私有桶，例如 `year-in-review-demos`，不要启用桶的公开访问。
2. 将桶绑定到项目，绑定名必须为 `DEMOS`。
3. 在项目设置中添加 Secret `DEPLOY_PASSWORD`，使用足够长的随机口令。口令只交给有权发布作品的人；不要设置为 `VITE_*` 环境变量。
4. 在桶的 Object lifecycle rules 添加删除规则：前缀 `demos/`，上传 7 天后删除。后端会按保存的到期时间立即拒绝过期访问，生命周期负责后续实际清理；未配置规则时，文件会继续占用存储，但过期后不会展示。
5. 更新部署项目后，点击「临时部署」，输入口令，点击「上传并生成链接」。页面会显示链接、复制按钮和到期时间。

**不知道当前是哪种部署：** 在 Cloudflare 的 Workers & Pages 列表里查看项目类型；默认域名以 `.pages.dev` 结尾的是 Pages，以 `.workers.dev` 结尾的是 Workers（自定义域名需要在控制台确认）。选择下面对应的一种方式即可。

**Cloudflare Pages：**

- 已提供 `functions/api/demos.js`、`functions/demo/[id].js` 和 `public/_routes.json`。
- 在 Pages 项目设置添加上述 R2 绑定与 Secret，生产/预览环境按需分别配置。Git 构建命令仍为 `npm run build`，输出目录仍为 `dist`，项目根目录必须包含 `functions`。
- 使用 Git 集成部署，或在项目根目录执行 `npx wrangler pages deploy dist --project-name 你的现有Pages项目名`。控制台拖拽上传 `dist` 不会编译这里的 Functions。

**Cloudflare Workers（静态资源）：**

- 已提供 `server/worker.js` 和 `wrangler.workers.jsonc`。
- 将配置中的 `name` 改成现有 Worker 名称，`bucket_name` 改成实际 R2 桶名；保留现有项目需要的其他配置。
- 构建命令：`npm run build`；部署命令：`npx wrangler deploy --config wrangler.workers.jsonc`。
- 在 Worker 设置添加 Secret，或执行 `npx wrangler secret put DEPLOY_PASSWORD --config wrangler.workers.jsonc`。不要把口令写进配置文件。
- `run_worker_first` 让 `/api/*` 和 `/demo/*` 请求进入后端，其余路径继续提供编辑器静态资源。

**本地联调（不会使用线上 R2）：**

在项目根目录创建被 Git 忽略的 `.dev.vars`，写入 `DEPLOY_PASSWORD=你自己的本地测试口令`，先执行 `npm run build`。然后选择：

- Pages：`npx wrangler pages dev dist --r2 DEMOS`
- Workers：`npx wrangler dev --config wrangler.workers.jsonc`

打开命令输出的本地地址测试部署和访问。单独 `npm run dev` 仅启动前端，不提供部署接口。

临时部署会将作品内容上传到服务器，持有链接的人可查看和保存全部内容；普通编辑、导入、导出仍在本地执行。作品响应使用 `no-store`、不索引提示和 CSP sandbox，保留翻页脚本但隔离编辑器的 localStorage/cookie。请不要为 `/demo/*` 配置覆盖 `no-store` 的强制缓存规则。R2 及动态请求用量按 Cloudflare 账户规则计费。

官方参考：[Pages R2 绑定](https://developers.cloudflare.com/pages/functions/bindings/)、[Workers 静态资源路由](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/)、[R2 生命周期](https://developers.cloudflare.com/r2/buckets/object-lifecycles/)、[Pages Functions 部署限制](https://developers.cloudflare.com/pages/get-started/direct-upload/)。
