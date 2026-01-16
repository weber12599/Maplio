# Maplio - Travel Itinerary Planner 🗺️

<p align="center">
  <a href="./README.zh-TW.md">繁體中文</a> | <a href="./README.md">English</a>
</p>

<br />

<div align="center">
  <img src="src/assets/logos/logo.svg" alt="Maplio Logo" width="180" />

  <h3>現代化旅遊行程規劃工具</h3>
  <p>
    互動式地圖 • 拖拉式排序 • 雲端同步
  </p>

  <p>
    <img src="https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=flat-square&logo=vue.js&logoColor=white" alt="Vue 3" />
    <img src="https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-FFCA28?style=flat-square&logo=firebase&logoColor=black" alt="Firebase" />
    <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind" />
    <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License" />
  </p>
</div>

<br />

Maplio 是一個基於 Vue 3 與 OpenStreetMap 的旅遊行程規劃工具。支援雲端同步 (Firebase) 與離線模式，讓使用者能夠輕鬆安排每日行程、交通方式與景點筆記。

## ✨ 功能特色

- 📅 **行程規劃**：拖拉式排序，支援每日行程管理。
- 🗺️ **地圖整合**：整合 OpenStreetMap，自動標記景點位置。
- ☁️ **雲端同步與共編 (Online Mode)**：使用 Google 帳號登入，資料自動儲存於 Firebase Firestore，支援跨裝置同步與多人即時協作。
- ⚡ **離線模式 (Offline Mode)**：支援純本地操作，資料儲存於瀏覽器 LocalStorage，保障隱私。
- 📱 **RWD 設計**：支援桌面與行動裝置瀏覽。

> **⚠️ 關於離線模式 (Offline Mode)**：
> 此模式意指 **「旅遊資料僅儲存於您的設備上，不會上傳至雲端」**。
> 但由於程式需載入地圖圖資 (OpenStreetMap) ，**使用時仍需保持網路連線**。

---

## 🚀 使用指南 (User Guide)

本專案提供多種使用方式，請根據您的需求選擇適合的情境：

### 1. 立即試用 (Try It Now)

如果您不想進行任何設定，只想立刻體驗 Maplio 的功能：

- **🌐 網頁版 (Web Demo - 離線模式範例)**
  直接訪問我們託管於 Netlify 的離線版本範例：
  🔗 **[點擊前往 Maplio Offline Demo](https://maplio-offline.netlify.app/#/)**

- **📂 本地檔案 (Local File)**
  下載單一 HTML 檔案，無網路也能使用：
    1.  前往 GitHub 的 **[Releases](../../releases)** 頁面。
    2.  下載最新版本的 `maplio-offline.zip` 並解壓縮。
    3.  使用 Chrome 、 Edge 或 Safari 瀏覽器直接開啟 `index.html` 即可。

### 2. 自行架設 - Firebase (推薦)

如果您希望擁有 **完整的雲端同步與共編功能** (Online Mode)，或是想要同時託管線上與離線版本，Firebase 是最佳選擇。

- **適用模式**：✅ Online Mode (雲端同步)、✅ Offline Mode (離線版託管)
- **優點**：支援 Google 登入、跨裝置同步行程、多人即時協作、同時部署雙版本。
- **教學**：請參考下方的 **[專案設置與部署](#-專案設置與部署-quick-start)** 章節，設定 Firebase 專案與 GitHub Actions 自動部署。

### 3. 自行架設 - Netlify (快速)

如果您只需要 **離線版功能**，Netlify 是最快速的免費方案。

- **適用模式**：✅ Offline Mode (僅限離線版)
- **優點**：無需寫程式、支援手機瀏覽。
- **步驟**：
    1.  下載並解壓縮 `maplio-offline.zip`。
    2.  開啟 **[Netlify Drop](https://app.netlify.com/drop)** 網頁。
    3.  將解壓縮出來的資料夾 **直接拖曳 (Drag & Drop)** 到網頁上傳區。
    4.  完成！您將獲得一個專屬網址，隨時隨地都能開啟您的地圖。🚀
        > **💡 小撇步**：部署完成後，您可以點擊 "Site settings" > "Change site name"，將網址改成您喜歡的 subdomain 名稱（例如 `my-trip-2024.netlify.app`），方便與旅伴分享！

---

## 🚀 專案設置與部署 (Quick Start)

本專案建議直接使用 **GitHub Actions** 進行自動部署。您只需設定好 Firebase 專案與 GitHub Secrets，即可上線。

> 💡 **建議**：請先 **Fork** 本專案到您的 GitHub 帳號，後續操作皆在您的 Fork 專案中進行。

### 1. 建立 Firebase 專案

若要使用雲端同步功能或託管離線版本，都需先建立 Firebase 專案：

1.  前往 [Firebase Console](https://console.firebase.google.com/) 並新增專案。

2.  **啟用 Authentication** (雲端同步適用)：
    - 進入 "Build" > "Authentication" > "Sign-in method"。
    - 開啟 **Google** 提供者。

3.  **建立 Firestore Database** (雲端同步適用)：
    - 進入 "Build" > "Firestore Database"。
    - 建立資料庫（建議選擇距離使用者較近的位置，如 `asia-east1`）。
    - **設定 Firestore Rules**：
      請將以下規則複製到 Firestore Console 的 Rules 分頁中，以確保權限控管正常運作：

    ```javascript
    service cloud.firestore {
      match /databases/{database}/documents {
        match /trips/{tripId} {
          // 1. 允許任何已登入使用者讀取單一行程 (為了檢查是否已在成員名單中)
          allow get: if request.auth != null;

          // 2. 只有成員可以列出 (list) 所有行程
          allow list: if request.auth != null && request.auth.uid in resource.data.members;

          // 3. 允許更新：
          // A: 成員可更新行程
          // B: 非成員僅可將自己加入 members (加入行程功能)
          allow update: if request.auth != null && (
            request.auth.uid in resource.data.members ||
            request.resource.data.diff(resource.data).affectedKeys().hasOnly(['members'])
          );

          // 4. 其他權限 (建立與刪除)
          allow create: if request.auth != null;
          allow delete: if request.auth != null && request.auth.uid in resource.data.members;
        }
      }
    }
    ```

4.  **取得配置 (Config)**：
    - 進入 "Project settings" (齒輪圖示) > "General"。
    - 在 "Your apps" 區塊新增一個 Web App。
    - 保留 `firebaseConfig` 中的資訊，下一步會用到。

### 2. 設定 GitHub Secrets

為了讓 GitHub Actions 能自動部署，請在您 Fork 的專案中設定環境變數：

前往 `Settings` > `Secrets and variables` > `Actions`，新增以下 Secrets：

**Firebase 配置 (數值來自上一步雲端版本專案的 Config)**

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

**Firebase 配置 (數值來自上一步離線版本專案的 Config)**

- `VITE_FIREBASE_PROJECT_ID_OFFLINE`

**Firebase Service Account (用於部署權限)**
需從 Firebase Console 下載 Service Account JSON 檔案 (Project settings > Service accounts)，並將檔案內容完整貼入 Secret：

- `FIREBASE_SERVICE_ACCOUNT_MAPLIO` (對應雲端版本專案)
- `FIREBASE_SERVICE_ACCOUNT_MAPLIO_OFFLINE` (對應離線版本專案)

**Netlify 配置 (用於自動更新離線網頁版)**

- `NETLIFY_AUTH_TOKEN`: 前往 [Netlify User Settings](https://app.netlify.com/user/applications#personal-access-tokens) 產生的 Personal Access Token。
- `NETLIFY_SITE_ID`: 您的 Netlify 網站 API ID（可在 Site configuration > General > Site details 中找到）。

### 3. 觸發部署

目前的部署流程設定為**手動觸發**。您無需在本地端執行 Git 指令，直接透過 GitHub 網頁介面即可操作：

1.  **執行 Workflow**：
    - 前往 GitHub 專案頁面的 **Actions** 分頁。
    - 在左側選單點選 **"Deploy to Firebase Hosting (Production)"**。
    - 點擊右側的 **"Run workflow"** 按鈕並設定參數：
        - **Branch**：選擇要建構的分支（通常為 `main`）。
        - **Deploy options**：勾選是否要部署至 Firebase 的 Online 或 Offline 環境。
        - **Version**：輸入版本號（例如 `v1.0.0`）。**(必填)**

---

## 🛠️ 本地開發指南 (Local Development)

如果您想要修改程式碼或在本地端測試，請依下列步驟設定。

### 1. 環境變數設定

在專案根目錄建立 `.env` 及 `.env.offline` 檔案，並填入 Firebase 資訊 (與 GitHub Secrets 內容相同)：

- **`.env` (雲端模式)**

    ```bash
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    ```

- **`.env.offline` (離線模式)**

    ```bash
    VITE_APP_MODE=offline
    ```

### 2. 安裝與執行

安裝依賴套件並啟動開發伺服器：

```bash
# 安裝依賴套件
npm install

# 啟動開發伺服器
npm run dev
```

啟動後，瀏覽器打開 `http://localhost:5173` 即可看到畫面。

---

## 📂 專案結構

```
src/
├── components/     # Vue 元件 (Auth, Layout, Map, Planner, Trip)
├── stores/         # Pinia 狀態管理 (auth, theme, trip)
├── views/          # 頁面 (Home, Login, Planner)
├── utils/          # 工具函式 (date, map, string, theme)
├── services/       # Firebase 服務邏輯
├── i18n/           # 多語系設定 (zh-TW, en-US)
└── firebase.js     # Firebase 初始化設定
```

## 📜 License

[MIT License](./LICENSE)
