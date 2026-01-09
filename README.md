# Maplio

<p align="center">
  <img src="public/logos/logo.svg" alt="Maplio Logo" width="180" />
</p>

<p align="center">
  <strong>Modern Travel Itinerary Planner</strong><br>
  Interactive Map • Drag & Drop • Cloud Sync<br>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vue.js-3.x-4FC08D?logo=vue.js" alt="Vue 3" />
  <img src="https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-FFCA28?logo=firebase" alt="Firebase" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css" alt="Tailwind" />
</p>

---

## 🚀 Features

- **🗺️ Interactive Map**: Visualize your itinerary with integrated Leaflet maps.
- **📅 Drag & Drop**: Easily reorder spots or move them between days.
- **☁️ Hybrid Storage**:
    - **Cloud Mode**: Sync across devices with Google Login.
    - **Demo Mode**: Try instantly without login (Local Storage).
- **🎨 Dual Themes**: Elegant Dark & Light (Muji) modes.
- **📱 Mobile Optimized**: Swipe gestures and responsive layout.

## ⚡ Quick Start

### 1. Installation

```bash
git clone https://github.com/weber12599/Maplio
cd Maplio
npm install
```

### 2. Environment Setup (.env)

Create a .env file with your Firebase credentials:

```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Run

```
npm run dev
```

## 📄 License

MIT License.
