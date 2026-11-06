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
* **Local editing:** Editing, importing and exporting run in your browser. Optional temporary publishing uploads the selected work and photos to Cloudflare Workers KV and creates a public link.
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

### 本地服务器部署（作品存入 data，无需 Cloudflare）

需要 Node.js 22.12 或更高版本。首次运行先执行 `npm install`，然后：

```bash
# 启动时交互输入端口
./start.sh

# 或手动将端口作为参数填写（例如 8080）
./start.sh 8080

# 停止后台服务，不删除作品
./stop.sh
```

也可使用 `npm start -- 8080` 和 `npm stop`。启动脚本会先执行 `npm run build`，再后台启动服务；更新代码后执行停止、启动即可。一个项目目录同时运行一个实例，修改端口也需先停止。脚本不填写默认端口，端口必须由你输入，范围为 1–65535。

服务监听 `0.0.0.0`，本机通过 `http://localhost:你填写的端口` 访问，局域网通过 `http://服务器IP:端口` 访问。需要公网域名时，将反向代理指向此端口，并将 `/api/*`、`/demo/*` 一起代理。生成的作品链接使用当前打开网站的域名和端口；要分享给其他设备，请从服务器 IP 或域名打开编辑器再发布。

点击「临时部署」即可上传，无需口令、Cloudflare 账户或数据库。每次发布写入独立目录：

```text
data/
└── 随机作品编号/
    ├── index.html       # 作品及内嵌照片
    └── metadata.json    # 到期时间
```

通过 `/demo/作品编号` 查看作品；`data` 不作为静态目录直接暴露。作品保留 7 天，单次上传上限 20 MB。启动时和运行中每小时清理过期作品，访问时也会检查到期时间；停机期间文件保留，下次启动补做清理。备份、迁移时保留整个 `data` 目录即可；停止、构建和重新启动不会清空它。

运行记录与日志放在 `.local-service/`，日志为 `.local-service/server.log`。`data` 中的作品及运行文件均被 Git 忽略。启动失败时检查日志（例如端口被占用）。前台运行可执行 `npm run build` 后执行 `npm run serve -- 8080`，按 Ctrl+C 停止；`./stop.sh` 只管理通过启动脚本开启的后台服务。

本地模式的发布接口无需口令，任何能访问服务器的人都可以发布作品。Cloudflare 模式仍使用下面的 KV 和口令配置，两种部署方式共用相同的前端，页面会自动识别当前服务器模式。单独 `npm run dev` 或 `npm run preview` 不提供本地保存接口。

### 临时部署到当前 Cloudflare 域名（Workers KV 免费方案）

顶部的「临时部署」复用 HTML 导出功能，将当前作品及照片存到 Workers KV，生成 `https://你的域名/demo/随机编号` 的公开链接。每次发布生成独立快照，无需重新构建网站。链接 7 天后自动过期并由 KV 删除，无需配置清理任务。上传上限 20 MB，本地导出仍支持 100 MB。新链接在其他地区可能需要约 60 秒同步；遇到暂时不存在的提示，请稍后重试。

**GitHub → Cloudflare Workers 部署：**

1. 将本次修改推送 GitHub。`wrangler.workers.jsonc` 已移除 R2 配置，使用 `kv_namespaces: [{ "binding": "DEMOS_KV" }]`。当前项目的 Wrangler 支持首次部署自动创建 KV，不需要开通 R2 订阅。
2. Workers Builds 的构建命令保持 `npm run build`，部署命令保持 `npx wrangler deploy --config wrangler.workers.jsonc`，根目录为仓库根目录。Worker 名称必须与配置中的 `name` 一致，当前为 `year-in-review`。
3. 首次部署会创建 KV 命名空间并绑定为 `DEMOS_KV`；以后复用已有绑定。GitHub 构建不会把生成的命名空间 ID 自动提交回仓库。建议部署成功后从控制台复制 ID，固定到配置中：

   ```json
   "kv_namespaces": [
     { "binding": "DEMOS_KV", "id": "控制台中的实际命名空间ID" }
   ]
   ```

4. Worker → Settings → Variables and Secrets，添加类型为 **Secret** 的 `DEPLOY_PASSWORD`，保存并部署。使用较长随机口令，只交给有权发布的人；不要写入 GitHub、`VITE_*` 变量或 Builds 构建变量。已有这个 Secret 时继续沿用。
5. 打开网站，点击「临时部署」，输入口令并上传。页面显示链接、复制按钮和到期时间。口令不会存入浏览器草稿，访客无需口令即可查看作品。

如果构建提示没有创建 KV 的权限，可以在 Cloudflare 控制台的 Workers KV 中手动创建命名空间（例如 `year-in-review-demos`），把实际 ID 按上述格式写入配置，推送后重新部署。构建使用的 API Token 需要具有对应账户的 Workers KV Storage 编辑权限。`DEMOS_KV` 是代码使用的绑定名，不能改为命名空间名称。

若曾成功部署过旧 R2 版本，旧作品不会自动搬迁到 KV，需要在编辑器重新发布。本次代码不会删除旧桶或桶内文件。

**Cloudflare Pages：**

Pages Functions 也共用 KV 后端。在 Pages 项目设置添加 KV 绑定 `DEMOS_KV` 和运行时 Secret `DEPLOY_PASSWORD`，生产/预览环境按需分别配置。Git 构建命令为 `npm run build`，输出目录为 `dist`，项目根目录需包含 `functions`。也可在根目录执行 `npx wrangler pages deploy dist --project-name 你的现有Pages项目名`；控制台拖拽上传 `dist` 不会编译 Functions。

**本地联调（不访问线上 KV）：**

在项目根目录创建被 Git 忽略的 `.dev.vars`，写入 `DEPLOY_PASSWORD=你自己的本地测试口令`，执行 `npm run build`，再选择：

- Workers：`npx wrangler dev --config wrangler.workers.jsonc`
- Pages：`npx wrangler pages dev dist --kv DEMOS_KV`

打开命令输出的本地地址测试上传和访问。单独 `npm run dev` 只启动前端，不提供部署接口。

Workers Free 包含 KV 免费额度：总存储 1 GB、每天 1,000 次写入和 100,000 次读取。免费计划超过限额会导致相关操作失败，不会自动升级付费。临时作品及照片会占用这些额度；高流量访问还受 Workers 自身额度限制。KV 单值上限 25 MiB，本项目保留 20 MB 上传限制。

普通编辑、导入、导出仍在本地执行。临时部署会上传全部作品内容，持有链接的人可以查看和保存。作品响应保留 `no-store`、不索引提示和 CSP sandbox，翻页脚本可以运行，但不能读取编辑器的 localStorage/cookie；后端同时检查到期时间，避免缓存内容在过期后继续展示。不要为 `/demo/*` 设置覆盖 `no-store` 的强制缓存规则。

官方参考：[KV 免费额度](https://developers.cloudflare.com/kv/platform/pricing/)、[KV 写入与自动过期](https://developers.cloudflare.com/kv/api/write-key-value-pairs/)、[Wrangler 自动创建资源](https://developers.cloudflare.com/workers/wrangler/configuration/#automatic-provisioning)、[Pages KV 绑定](https://developers.cloudflare.com/pages/functions/bindings/)。
