# personalsite — 李炳輝個人門面網站

Astro 4 靜態站，中文（zh-tw，根路徑 `/`）＋ English（`/en/`）雙語，內容來源為本專案 `db/resume.db`
（見 `../Sprint_personalsite_aboutme.md`）。設計理念、內容契約、里程碑紀錄都在該 Sprint 文件，本檔只講
「怎麼跑起來、怎麼更新內容、怎麼上線」。

## 專案簡介

- 四頁：首頁 / 關於我 / 作品 / 履歷，各自有 zh-tw 與 `/en/` 對應版本（共 8 個路由 + 404）
- 純靜態輸出，無 client-side framework；語言/主題切換用少量 inline vanilla JS
- 內容分兩層：
  - `../db-export/*.json` — 由 `../extract_content.py` 從 `db/resume.db` 抽取，含 publicness 過濾，可重跑覆蓋
  - `src/data/*.json` — 站方雙語策展內容（`site-copy.json` / `experiences.json` / `projects.json` / `skills.json`），
    由 db-export 加工而成，是頁面實際讀取的資料

## 本機開發

### ⚠️ 中文路徑地雷（必讀）

本機路徑 `D:\000 Projects\職業履歷計劃\personalsite\site\` 含中文字元。Astro/Vite 工具鏈的原生模組
（rollup/esbuild 一類）在 Windows 上對含中文路徑會直接原生當機（native crash，無 JS 例外、無錯誤訊息，
`npm run build` 印兩行就終止，exit code 常是 `-1073740791`）。

**Workaround：用 Windows Junction 把 `site/` 對應到純 ASCII 路徑再執行任何 npm 指令。**

```powershell
# 建一次即可（junction 是資料夾捷徑，不是複製，會直接反映原始檔案的變動）
New-Item -ItemType Junction -Path "C:\Users\<user>\dev-links\personalsite-site" -Target "D:\000 Projects\職業履歷計劃\personalsite\site"

# 之後所有開發都在 junction 路徑下執行
cd C:\Users\<user>\dev-links\personalsite-site
npm install
npm run dev        # 本機預覽，含 hot reload
npm run build       # 產出 dist/
npm run preview     # 預覽 build 產物
```

junction 已存在的話直接 `cd` 過去即可，不需要每次重建。**任何 agent（Claude Code / Codex）在本機執行
`npm run dev` / `build` / `preview` 都必須透過此 junction**，直接在中文路徑下執行會當機。

### 套件

僅兩個 dependency：`astro`（^5）+ `@astrojs/sitemap`（latest，需 Astro 5）。

> **為什麼是 Astro 5 而非 4**：Astro 4.16 在本機（Node 24）會靜默丟失所有 CSS 注入（樣式有打包但頁面完全不掛 `<link rel="stylesheet">`），升級 Astro 5 後解決。同時 `astro.config.mjs` 必須保留 `vite.resolve.preserveSymlinks: true`——否則 Vite 會把 junction 解析回中文真實路徑，原生模組處理 CSS 時再度靜默失敗（同樣是樣式全部消失，build 卻顯示成功）。
沒有 framer-motion / i18next / TypeScript 空殼——這些是舊站移除的死重量，新站刻意不重蹈覆轍。

## 內容更新流程

站點內容一律以 `db/resume.db` 為唯一事實來源，禁止手改 `src/data/*.json` 塞入 DB 沒有的事實。更新流程：

1. 用 `resume-intake` skill 把新素材／修訂寫進 `db/resume.db`（materials / bullets / tags）
2. 在 repo 根目錄跑：
   ```powershell
   python personalsite/extract_content.py
   ```
   重新產生 `personalsite/db-export/*.json`（stdlib sqlite3，publicness 過濾在此層完成，冪等可重跑）
3. 對照 `db-export/*.json` 的新增/變動，手動策展進 `site/src/data/*.json`（雙語，兩個 locale 都要更新，
   保持 key/array 結構一致 —— parity 檢查方式見 Sprint 文件 M3 QA）
4. 若新增/移除素材涉及 publicness 邊界（`不可公開`／`部分可公開`），先確認 §8.2 契約規則有沒有守住
   （`不可公開` 零洩漏；`部分可公開` 需已抽象化，不得補回客戶名或精確金額）
5. 透過 junction 路徑跑 `npm run build`，過一遍 M3/M4 QA 清單（見 Sprint 文件 §9）
6. commit（`db-export/` 與 `src/data/` 都要跟著 commit，維持可重建性）

## GitHub Pages 上線步驟

本站設計為獨立 repo（`<username>.github.io` user page，或任一 project page repo），因為 GitHub Pages
的 Actions 部署要求 workflow 檔案在該 repo 的 `.github/workflows/`。

**本站實際採用 project page 形式**：repo 為 `BlekZz/Blake_Resume-Portfolio`，最終網址為
`https://blekzz.github.io/Blake_Resume-Portfolio/`。`astro.config.mjs` 已對應設定
`site: 'https://blekzz.github.io'`、`base: '/Blake_Resume-Portfolio'`。

1. **建 repo**：`BlekZz/Blake_Resume-Portfolio`（project page，非 user page）。
2. **推內容**：把本目錄（`personalsite/site/` 底下所有檔案，含 `.github/`）push 到該 repo 的 `main` 分支
   （只需要 `site/` 這一層的內容，不含 `personalsite/` 的其他檔案如 `extract_content.py`／`db-export/`／
   Sprint 文件——那些留在本 monorepo 做內容治理用）。
3. **`astro.config.mjs` 的 `site`/`base` 已就位**，若日後改成別的 repo 名稱或改用 user page，
   同步調整 `site`／`base`、`public/robots.txt` 的 Sitemap 網址、`public/site.webmanifest` 的
   `start_url`／icon `src`。
4. **開啟 GitHub Pages**：repo → Settings → Pages → Build and deployment → Source 選
   **GitHub Actions**（不是 "Deploy from a branch"）。`.github/workflows/deploy.yml` 會在下一次 push 到
   `main` 時自動跑（也可以在 Actions 頁手動 `workflow_dispatch` 觸發）。
5. 等 Actions 跑完（Build + Deploy 兩個 job），`https://blekzz.github.io/Blake_Resume-Portfolio/` 即可訪問。
   之後每次 push `main` 都會自動重新部署。

## TODO 清單（上線前／內容定稿後需要處理）

- [x] **LinkedIn URL**：`src/data/site-copy.json` 的 `contact.linkedin` 已換成本人實際 LinkedIn 個人頁
      `https://www.linkedin.com/in/blekzz0918/`，並已加入 `src/layouts/Base.astro` 的 `personSchema.sameAs`
- [x] **Google Drive Portfolio URL**：首頁 hero 的 `Google Drive Portfolio` 按鈕已改為讀取
      `site-copy.json` 的 `contact.portfolio`（`src/pages/index.astro`、`src/pages/en/index.astro`），
      連到實際作品集資料夾公開分享連結
- [ ] **OG 圖重製**：`public/og-preview.png` 是舊站產物暫用，內容/版面與新站不完全對應。新站文案與視覺
      定稿後應重新產一張 1200×630 的 OG 圖（可參考舊站 `dist/og-preview-source.html` 的產生方式）
- [x] **台灣公司登記 Open Data 爬蟲卡片**：該素材（PROJ-022）repo 未公開，已從 Side Projects 卡片牆移除
      （連同 PROJ-023 Excel-to-PDF、PROJ-025 Claude Code 跨裝置設定同步，三者皆為原始碼未公開的內部工具），
      改上架兩個公開 GitHub repo 的新專案：Pipeline Schedule Visualizer、Data Judgment Training Platform
      （細節見 `../Sprint_personalsite_aboutme.md` §12）
- [x] `astro.config.mjs` 的 `site` / `base`：已依 project pages 部署形式填入
      `site: 'https://blekzz.github.io'`、`base: '/Blake_Resume-Portfolio'`，見下方「GitHub Pages 上線步驟」
