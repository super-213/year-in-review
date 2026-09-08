import { DEFAULT_CHART } from './charts.js';
import { translate } from './i18n.js';
export const DEFAULT_LABELS = {
  en: {
    coffee: "Coffees", book: "Books Read", activity: "Workouts", zap: "Moments",
    heart: "Kindness", work: "Projects", music: "Minutes Listened", globe: "Countries",
    terminal: "Lines of Code", feather: "Words Written", phone: "Screen Time",
    camera: "Photos Taken", star: "Achievements", disc: "Albums", duolingo: "Streak Days",
    language: "Languages", strava_cycle: "km Cycled", strava_run: "km Run",
    gym: "Gym Sessions", travel: "Trips", gaming: "Hours Played", coding: "Commits",
    git: "PRs Merged", design: "Designs", finance: "Savings", spotify: "Top Genre",
    youtube: "Hours Watched", food: "New Foods", sleep: "Avg Sleep", location: "Places",
    social_x: "Tweets", social_insta: "Posts", social_linked: "Connections"
  },
  id: {
    coffee: "Kopi Diminum", book: "Buku Tamat", activity: "Olahraga", zap: "Momen Seru",
    heart: "Kebaikan", work: "Proyek", music: "Menit Dengar", globe: "Negara",
    terminal: "Baris Kode", feather: "Kata Ditulis", phone: "Durasi Layar",
    camera: "Foto Diambil", star: "Pencapaian", disc: "Album", duolingo: "Hari Streak",
    language: "Bahasa", strava_cycle: "km Sepeda", strava_run: "km Lari",
    gym: "Sesi Gym", travel: "Perjalanan", gaming: "Jam Main", coding: "Total Commit",
    git: "PR Merged", design: "Desain", finance: "Tabungan", spotify: "Genre Top",
    youtube: "Jam Nonton", food: "Makanan Baru", sleep: "Rata-rata Tidur",
    location: "Tempat", social_x: "Tweets", social_insta: "Postingan", social_linked: "Koneksi"
  }
};

export const TEMPLATES = {
  en: {
    year: '2025', title: 'The Year of Growth', subtitle: 'Building Foundations',
    summary: "A year defined not by the destination, but by the journey.",
    stats: [
      { id: 1, label: 'Books Read', value: '12', icon: 'book' },
      { id: 2, label: 'Streak Days', value: '365', icon: 'duolingo' },
      { id: 3, label: 'km Run', value: '150', icon: 'strava_run' },
      { id: 4, label: 'Commits', value: '840', icon: 'git' }
    ],
    highlights: [
      { id: 1, title: 'Career Milestone', desc: 'Shipped my first major project.', emoji: '🚀' },
      { id: 2, title: 'Travel Goal', desc: 'Visited Japan.', emoji: '🌸' },
      { id: 3, title: 'New Hobby', desc: 'Learned photography.', emoji: '📸' }
    ],
    photos: [
      { id: 1, url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=500', caption: 'Big Wins' },
      { id: 2, url: 'https://images.unsplash.com/photo-1516724562728-afc824a36e84?auto=format&fit=crop&q=80&w=500', caption: 'Vibes' }
    ]
  },
  id: {
    year: '2025', title: 'Tahun Bertumbuh', subtitle: 'Membangun Pondasi',
    summary: "Tahun yang didefinisikan bukan oleh tujuan, tapi perjalanannya.",
    stats: [
      { id: 1, label: 'Buku Tamat', value: '12', icon: 'book' },
      { id: 2, label: 'Hari Streak', value: '365', icon: 'duolingo' },
      { id: 3, label: 'km Lari', value: '150', icon: 'strava_run' },
      { id: 4, label: 'Total Commit', value: '840', icon: 'git' }
    ],
    highlights: [
      { id: 1, title: 'Karir Baru', desc: 'Menyelesaikan proyek besar pertama.', emoji: '🚀' },
      { id: 2, title: 'Liburan Impian', desc: 'Mengunjungi Jepang.', emoji: '🌸' },
      { id: 3, title: 'Hobi Baru', desc: 'Belajar fotografi.', emoji: '📸' }
    ],
    photos: [
      { id: 1, url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=500', caption: 'Big Wins' },
      { id: 2, url: 'https://images.unsplash.com/photo-1516724562728-afc824a36e84?auto=format&fit=crop&q=80&w=500', caption: 'Vibes' }
    ]
  }
};

export const TRANSLATIONS = {
  en: {
    title: "MY YEAR EDIT", subtitle: "Curate your moments, design your story.",
    reset: "Start Over", chooseVibe: "6. Vibe Check", scroll: "Scroll",
    coreInfo: "1. The Intro", year: "Year", themeTitle: "Theme Title", metaSubtitle: "Subtitle",
    numbers: "2. The Receipts", highlights: "3. Core Memories", highlightTitle: "Title", desc: "Description",
    gallery: "4. Photo Dump", change: "Swap", add: "Add", summary: "5. The Outro", autoGen: "Magic Write",
    privacyTitle: "100% Private", privacyText: "Your data stays on your device.",
    preview: "Preview Story", saveSlide: "Screenshot Mode", saving: "Saving...", exitScreenshot: "Close Preview",
    screenshotHint: "Tap 'Screenshot Mode' to view full screen & capture",
    helpTitle: "How to use", helpDesc: "Create your own aesthetic year-in-review.",
    step1: "Fill in stats & memories", step2: "Upload photos", step3: "Choose theme", step4: "Open Screenshot Mode",
    close: "Got it!", madeBy: "made with year-in-review-generator",
    
    // Onboarding
    welcomeTitle: "Welcome to Year Edit!",
    welcomeDesc: "Turn your yearly stats and memories into stunning, shareable aesthetic slides in seconds.",
    start: "Start Creating",

    // Theme specific
    pressStart: "PRESS START", playerStats: "PLAYER_STATS", achievements: "ACHIEVEMENTS", memoryDump: "MEMORY_DUMP", endTrans: "END_OF_TRANSMISSION",
    annualReport: "ANNUAL REPORT", keyPoints: "KEY POINTS", endReport: "END REPORT", fig: "FIG",
    collection: "The Collection", moments: "MOMENTS", seeYou: "See you next year...",
    systemBoot: ":: SYSTEM_BOOT ::", neuralStats: "NEURAL_STATS", coreMem: "CORE_MEMORY", visualLogs: "VISUAL_LOGS", endLine: "END_OF_LINE_",
    keyFigures: "Key Figures", fin: "Fin.", wow: "WOW!", pow: "POW!", snap: "SNAP!",
    aesthetics: "A E S T H E T I C S", memoriesExe: "memories.exe", visuals: "V I S U A L S",
    volume: "JILID", indexRerum: "INDEKS", chronicles: "KRONIK", plates: "PELAT", finis: "— FINIS —",
    
    myStats: "MY STATS",
    wins: "BIG WINS",
    pics: "EVIDENCE",
    recap: "RECAP"
  },
  id: {
    title: "EDISI TAHUNKU", subtitle: "Kurasi momenmu, desain ceritamu.",
    reset: "Ulang Awal", chooseVibe: "6. Cek Vibe", scroll: "Geser",
    coreInfo: "1. Intro Dulu", year: "Tahun", themeTitle: "Judul Utama", metaSubtitle: "Subjudul",
    numbers: "2. Spill Angka", highlights: "3. Highlight Seru", highlightTitle: "Judul", desc: "Deskripsi",
    gallery: "4. Dump Foto", change: "Ganti", add: "Tambah", summary: "5. Pesan & Kesan", autoGen: "Tulis Ajaib",
    privacyTitle: "100% Privat", privacyText: "Data kamu aman di perangkat ini.",
    preview: "Pratinjau", saveSlide: "Mode Screenshot", saving: "Menyimpan...", exitScreenshot: "Tutup Preview",
    screenshotHint: "Ketuk 'Mode Screenshot' untuk layar penuh & capture",
    helpTitle: "Cara Pakai", helpDesc: "Bikin rekap tahunan estetikmu.",
    step1: "Isi statistik & kenangan", step2: "Upload foto", step3: "Pilih tema", step4: "Buka Mode Screenshot",
    close: "Siap, gas!", madeBy: "dibuat dengan year-in-review-generator",

    // Onboarding
    welcomeTitle: "Selamat Datang di Edisi Tahunku!",
    welcomeDesc: "Ubah statistik dan kenangan tahunanmu menjadi slide estetik yang siap dibagikan dalam hitungan detik.",
    start: "Mulai Membuat",
    
    // Theme specific
    pressStart: "TEKAN MULAI", playerStats: "STATISTIK_PEMAIN", achievements: "PENCAPAIAN", memoryDump: "MEMORI_DUMP", endTrans: "TRANSMISI SELESAI",
    annualReport: "LAPORAN TAHUNAN", keyPoints: "POIN UTAMA", endReport: "LAPORAN SELESAI", fig: "GBR",
    collection: "Koleksi", moments: "MOMEN", seeYou: "Sampai jumpa...",
    systemBoot: ":: SISTEM_MULAI ::", neuralStats: "STAT_NEURAL", coreMem: "MEMORI_INTI", visualLogs: "LOG_VISUAL", endLine: "AKHIR_BARIS_",
    keyFigures: "Angka Kunci", fin: "Selesai.", wow: "WAH!", pow: "DUAR!", snap: "JEPRET!",
    aesthetics: "E S T E T I K A", memoriesExe: "memori.exe", visuals: "V I S U A L",
    volume: "JILID", indexRerum: "INDEKS", chronicles: "KRONIK", plates: "PELAT", finis: "— TAMAT —",
    
    myStats: "STATISTIK",
    wins: "PENCAPAIAN",
    pics: "DOKUMENTASI",
    recap: "REKAP"
  }
};


TRANSLATIONS.zh = {
  "title": "我的年度回顾",
  "subtitle": "珍藏你的瞬间，书写你的故事。",
  "reset": "重新开始",
  "chooseVibe": "6. 选择风格",
  "scroll": "滚动",
  "coreInfo": "1. 开场介绍",
  "year": "年份",
  "themeTitle": "主题标题",
  "metaSubtitle": "副标题",
  "numbers": "2. 年度数据",
  "highlights": "3. 高光时刻",
  "highlightTitle": "标题",
  "desc": "说明",
  "gallery": "4. 照片墙",
  "change": "替换",
  "add": "添加",
  "summary": "5. 年度总结",
  "autoGen": "智能生成",
  "privacyTitle": "完全私密",
  "privacyText": "你的数据仅保存在当前设备。",
  "preview": "预览故事",
  "saveSlide": "截图模式",
  "saving": "正在保存…",
  "exitScreenshot": "关闭预览",
  "screenshotHint": "点击“截图模式”全屏查看并截图",
  "helpTitle": "使用方法",
  "helpDesc": "创建属于你的年度回顾。",
  "step1": "填写数据与回忆",
  "step2": "上传照片",
  "step3": "选择主题",
  "step4": "打开截图模式",
  "close": "知道了",
  "madeBy": "使用 year-in-review-generator 制作",
  "welcomeTitle": "欢迎创建年度回顾！",
  "welcomeDesc": "将一年的数据与回忆变成精美页面，珍藏并分享你的故事。",
  "start": "开始创作",
  "pressStart": "开始旅程",
  "playerStats": "玩家数据",
  "achievements": "年度成就",
  "memoryDump": "回忆存档",
  "endTrans": "传输结束",
  "annualReport": "年度报告",
  "keyPoints": "关键时刻",
  "endReport": "报告结束",
  "fig": "图",
  "collection": "年度收藏",
  "moments": "精彩瞬间",
  "seeYou": "明年再见…",
  "systemBoot": ":: 系统启动 ::",
  "neuralStats": "神经数据",
  "coreMem": "核心记忆",
  "visualLogs": "影像日志",
  "endLine": "记录结束_",
  "keyFigures": "关键数据",
  "fin": "终章",
  "wow": "哇！",
  "pow": "砰！",
  "snap": "咔嚓！",
  "aesthetics": "美 好 日 常",
  "memoriesExe": "回忆.exe",
  "visuals": "视 觉 记 忆",
  "volume": "卷",
  "indexRerum": "索引",
  "chronicles": "年度纪事",
  "plates": "图版",
  "finis": "— 完 —",
  "myStats": "我的数据",
  "wins": "年度成就",
  "pics": "影像记录",
  "recap": "年度回顾"
};
DEFAULT_LABELS.zh = {
  "coffee": "咖啡杯数",
  "book": "读完的书",
  "activity": "运动次数",
  "zap": "精彩瞬间",
  "heart": "善意行动",
  "work": "项目数",
  "music": "听歌分钟",
  "globe": "到访国家",
  "terminal": "代码行数",
  "feather": "写作字数",
  "phone": "屏幕时间",
  "camera": "拍摄照片",
  "star": "成就数",
  "disc": "专辑数",
  "duolingo": "连续打卡天数",
  "language": "学习语言",
  "strava_cycle": "骑行公里",
  "strava_run": "跑步公里",
  "gym": "健身次数",
  "travel": "旅行次数",
  "gaming": "游戏小时",
  "coding": "提交次数",
  "git": "合并请求",
  "design": "设计作品",
  "finance": "储蓄",
  "spotify": "最爱曲风",
  "youtube": "观看小时",
  "food": "新尝美食",
  "sleep": "平均睡眠",
  "location": "到访地点",
  "social_x": "推文",
  "social_insta": "动态",
  "social_linked": "人脉"
};
TEMPLATES.zh = { ...structuredClone(TEMPLATES.en), title: '成长的一年', subtitle: '为未来打下基础', summary: '这一年，意义不只在于终点，更在于一路走过的风景。', stats: TEMPLATES.en.stats.map(item => ({ ...item, label: DEFAULT_LABELS.zh[item.icon] })), highlights: [{ id: 1, title: '事业里程碑', desc: '完成了我的第一个重要项目。', emoji: '🚀' }, { id: 2, title: '旅行目标', desc: '去了日本旅行。', emoji: '🌸' }, { id: 3, title: '新的爱好', desc: '学会了摄影。', emoji: '📸' }], photos: TEMPLATES.en.photos.map((item, i) => ({ ...item, caption: ['闪光时刻', '生活气息'][i] })) };

for (const language of ['en', 'zh', 'id']) {
  TEMPLATES[language].chart = { ...structuredClone(DEFAULT_CHART),
    title: translate(language, DEFAULT_CHART.title),
    description: translate(language, DEFAULT_CHART.description),
    items: DEFAULT_CHART.items.map(item => ({ ...item, label: translate(language, item.label) })),
  };
}
