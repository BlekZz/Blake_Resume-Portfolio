import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// 部署設定（GitHub Pages）：
// - `site`：上線前改成實際 GitHub Pages 網址，例如 https://<username>.github.io
// - `base`：僅在 project pages（非 <username>.github.io 根網域，例如
//   https://<username>.github.io/<repo>/）時需要設定，值為 '/<repo>/'；
//   若是根網域（<username>.github.io 本身）則留空或省略。
export default defineConfig({
  site: 'https://blekzz.github.io',
  base: '/Blake_Resume-Portfolio',

  i18n: {
    defaultLocale: 'zh-tw',
    locales: ['zh-tw', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  integrations: [sitemap()],

  // Windows 中文路徑 workaround（詳見 README「本機開發」）：
  // 本專案真實路徑含中文字元，Vite 原生模組處理 CSS 資產時會靜默失敗（樣式全部消失）。
  // 必須透過 ASCII junction（C:/Users/<user>/dev-links/personalsite-site）執行 build，
  // 且需 preserveSymlinks 讓 Vite 不把 junction 解析回中文真實路徑。
  vite: {
    resolve: {
      preserveSymlinks: true,
    },
  },
});
