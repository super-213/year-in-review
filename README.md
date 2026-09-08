# 📅 Year in Review Generator

![Project Status](https://img.shields.io/badge/status-live-success)
![License](https://img.shields.io/badge/license-MIT-blue)
![Tech Stack](https://img.shields.io/badge/stack-React%20%7C%20Tailwind%20%7C%20Vite-blueviolet)

> **Turn your yearly stats and memories into aesthetic, shareable stories.**

A privacy-focused, zero-backend web application that empowers users to visualize their year (reading stats, fitness goals, coding commits, etc.) in a "Spotify Wrapped" style format. Features 12+ unique visual themes ranging from 8-Bit Retro to Cyberpunk Neon.

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
* **Zero Backend:** No user text, data, or photos are sent to any server. Everything is processed directly in your browser.
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
* Node.js (v18 or higher recommended)
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
