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

- 上传照片和可下载的外链照片会内嵌在导出的 HTML 中，相同图片只保存一份；展示页面按当前页及相邻页附加图片地址，避免一次解码全部图片。外链无法读取时会提示具体照片，需改为上传本地图片再导出，避免部署后丢图。
- 支持 PNG、JPEG、GIF、WebP、AVIF、BMP 照片；HTML 作品文件最大 100 MB。
- 使用本机系统字体，不请求 Google Fonts，已移除 Google Analytics 脚本。内容、照片和翻页不依赖编辑器服务器。
- HTML 内的作品数据是公开页面的一部分；导入只解析数据，不执行文件中的 HTML 或脚本。
- `npm run build` 用于构建编辑器。部署单个作品只需上传导出的 `index.html`。

运行 `npm test` 验证作品格式、所有主题的数据往返、非法文件拒绝与照片打包失败处理。

### 手机编辑

小于 1024px 的屏幕使用顶部「编辑 / 预览」切换。表单独立滚动，切换视图保留内容与编辑位置；预览按可用屏幕缩放，支持原生左右滑动及按钮翻页。全屏预览也支持滑动，纵向滚动用于阅读页内内容；关闭后仍停留在选中的页面。桌面维持左右分栏。

手机输入框使用至少 16px 字号，按钮触摸区域至少 44px，照片的替换入口始终可见。界面会跟随可视视口调整高度，并为刘海和底部安全区留白。全屏截图模式可轻点恢复操作，键盘用户可用 Esc 返回。

`npm run test:mobile` 是可选的 Playwright 浏览器回归检查，覆盖 320、375、390、430px 手机尺寸、原生触摸翻页、编辑位置保留、模拟键盘视口、横竖屏切换、对话框焦点和桌面分栏。运行前安装 Playwright 和浏览器（`npm install --no-save --package-lock=false playwright`，`npx playwright install chromium`），并执行 `npm run build`。已有 Chrome 时可通过 `CHROME_PATH` 指定浏览器路径；`PLAYWRIGHT_MODULE` 可指向已有 Playwright 模块。

### Core Memories 图片

每条回忆的 Emoji 下方提供「上传图片」。图片会替代 Emoji 显示在全部主题中，支持替换图片，或「移除图片，恢复 Emoji」。原 Emoji 会保留。
图片随浏览器草稿自动保存，并内嵌到导出的 HTML 中，重新导入后仍可编辑。支持 PNG、JPEG、GIF、WebP、AVIF、BMP，单张不超过 10 MB；旧版仅含 Emoji 的作品仍可导入。

照片墙和回忆中的静态图片会在上传时自动缩放到最长边 1600 像素，并尝试以质量 0.82 转成 WebP；小图不会放大，尺寸不变且压缩更大时保留原文件。GIF 和识别到的 WebP/AVIF 动画保留动画，不经过静态画布转换。发布和导出时也会优化旧草稿及外链图片；相同地址在一次打包中只处理一次。

### 自由组合页面

在「页面管理」中添加封面、年度数据、高光时刻、照片墙、年度总结或图表页面，点击页面进入编辑。拖动每行左侧手柄可调整顺序，鼠标和手机触摸均支持；也可使用右侧上下箭头排序或删除不需要的页面（至少保留一页）。拖动时卡片跟随指针，其他页面平滑让位，松手后落位；上下按钮同样有位置过渡。长列表拖至编辑区域边缘会自动滚动，拖动以外的区域仍可正常纵向浏览。

键盘聚焦手柄后，按空格键拾起、上下方向键移动，再按空格键放下，Esc 取消。排序会保留原来选中的页面及其独立内容，立即更新预览顺序，并随草稿保存及 HTML 导出。系统开启「减少动态效果」时关闭位移与落位动画。同一种页面可以重复添加，年份、主标题、副标题和风格为作品共用。

`npm run test:page-order` 使用与手机检查相同的可选 Playwright 环境，验证按钮动画、鼠标与手机拖动、普通触摸滚动、长列表自动滚动、键盘取消、当前页面保留、草稿与导出顺序，以及减少动态效果设置。

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

服务监听 `0.0.0.0`，本机通过 `http://localhost:你填写的端口` 访问，局域网通过 `http://服务器IP:端口` 访问。需要公网域名时，将反向代理指向此端口，并将 `/api/*`、`/s/*` 一起代理。生成的作品链接使用当前打开网站的域名和端口；要分享给其他设备，请从服务器 IP 或域名打开编辑器再发布。

点击「临时部署」即可上传，无需口令、Cloudflare 账户或数据库。每次发布写入独立目录：

```text
data/
└── 随机作品短码/
    ├── index.html       # 作品页面，图片使用独立地址
    ├── assets/          # 去重后的图片文件
    └── metadata.json    # 到期时间
```

通过 `/s/作品短码` 查看作品；`data` 不作为静态目录直接暴露。作品保留 7 天，单次上传上限 20 MB。启动时和运行中每小时清理过期作品，访问时也会检查到期时间；停机期间文件保留，下次启动补做清理。备份、迁移时保留整个 `data` 目录即可；停止、构建和重新启动不会清空它。

本地发布会将内嵌图片拆成独立文件，按内容哈希去重，在当前页和相邻页需要时请求。仅访问封面不会下载远处照片页的全部图片。图片缓存最长一天，且不会超过作品到期时间；作品 HTML 仍使用 `no-store`。公开地址统一改为 `/s/8位短码`，不兼容旧的长链接；已有作品可在编辑器重新发布。不会自动迁移或删除旧数据目录。

需要可离线打开、重新导入编辑的单个 HTML 时，使用编辑器的「导出可部署 HTML」，或本地发布结果中的同名下载链接（`/s/作品短码/download`）。下载时才将独立图片重新内嵌，无需在磁盘保存重复副本。直接复制 `data` 内的 `index.html` 不能脱离对应 `assets` 使用。

本地服务器支持按客户端能力流式 Brotli/gzip 压缩 HTML、JS、CSS、JSON 等文本。带构建哈希的 `dist/assets` 资源缓存一年，其余前端文件通过 ETag 重新验证。独立图片保持原编码，不重复压缩。Cloudflare 仍使用 KV 保存可移植 HTML，图片数据也会去重，但不会拆分为本地文件。

运行记录与日志放在 `.local-service/`，日志为 `.local-service/server.log`。`data` 中的作品及运行文件均被 Git 忽略。启动失败时检查日志（例如端口被占用）。前台运行可执行 `npm run build` 后执行 `npm run serve -- 8080`，按 Ctrl+C 停止；`./stop.sh` 只管理通过启动脚本开启的后台服务。

本地模式的发布接口无需口令，任何能访问服务器的人都可以发布作品。Cloudflare 模式仍使用下面的 KV 和口令配置，两种部署方式共用相同的前端，页面会自动识别当前服务器模式。单独 `npm run dev` 或 `npm run preview` 不提供本地保存接口。

### 短链接与主题二维码宣传卡

每次发布生成 8 位大小写字母及数字短码，例如 `https://你的域名/s/K7mQ2x9B`，并检查已存在短码后重试。本地存储还会通过原子目录写入避免覆盖已有作品。Cloudflare KV 的跨地区读写存在传播延迟，不提供原子短码分配；高随机空间降低了碰撞概率。

发布结果显示简洁链接、复制按钮和二维码宣传卡。宣传卡自动使用发布时的主题、年份、标题、副标题和到期时间，也可单独切换卡片风格。12 个主题拥有独立构图、装饰与二维码样式；二维码保留完整码点、定位图形和四模块留白，不覆盖中心图案。

[查看 12 套宣传卡模板预览](docs/share-card-templates.png)（预览使用示例链接；实际卡片由发布成功后的真实链接生成）。

点击「保存宣传卡 PNG」下载 1080 × 1440 高清图片，手机也可长按图片保存；支持系统文件分享的浏览器会显示「分享卡片」。宣传卡与二维码在浏览器本地生成，不向第三方二维码服务提交链接。二维码组件仅在发布成功后按需加载，不增加编辑器首屏的二维码依赖。扫码打开的仍是同一个 7 天临时作品，图片中会标明过期时间。

`npm run test:sharing` 使用与手机检查相同的可选 Playwright 环境，验证 12 套模板在原始尺寸和 360px 缩小后能解码为正确链接，并检查复制及实际下载 PNG 的流程。解码器 jsQR 仅为开发测试依赖。

### 临时部署到当前 Cloudflare 域名（Workers KV 免费方案）

顶部的「临时部署」复用 HTML 导出功能，将当前作品及照片存到 Workers KV，生成 `https://你的域名/s/8 位短码` 的公开链接。每次发布生成独立快照，无需重新构建网站。链接 7 天后自动过期并由 KV 删除，无需配置清理任务。上传上限 20 MB，本地导出仍支持 100 MB。新链接在其他地区可能需要约 60 秒同步；遇到暂时不存在的提示，请稍后重试。

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

普通编辑、导入、导出仍在本地执行。临时部署会上传全部作品内容，持有链接的人可以查看和保存。作品响应保留 `no-store`、不索引提示和 CSP sandbox，翻页脚本可以运行，但不能读取编辑器的 localStorage/cookie；后端同时检查到期时间，避免缓存内容在过期后继续展示。不要为 `/s/*` 设置覆盖 `no-store` 的强制缓存规则。

官方参考：[KV 免费额度](https://developers.cloudflare.com/kv/platform/pricing/)、[KV 写入与自动过期](https://developers.cloudflare.com/kv/api/write-key-value-pairs/)、[Wrangler 自动创建资源](https://developers.cloudflare.com/workers/wrangler/configuration/#automatic-provisioning)、[Pages KV 绑定](https://developers.cloudflare.com/pages/functions/bindings/)。
