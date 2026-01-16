# Maplio - Travel Itinerary Planner 🗺️

<p align="center">
  <a href="./README.zh-TW.md">繁體中文</a> | <a href="./README.md">English</a>
</p>

<br />

<div align="center">
  <img src="src/assets/logos/logo.svg" alt="Maplio Logo" width="180" />

  <h3>Modern Travel Itinerary Planner</h3>
  <p>
    Interactive Map • Drag & Drop • Cloud Sync
  </p>

  <p>
    <img src="https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=flat-square&logo=vue.js&logoColor=white" alt="Vue 3" />
    <img src="https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-FFCA28?style=flat-square&logo=firebase&logoColor=black" alt="Firebase" />
    <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind" />
    <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License" />
  </p>
</div>

<br />

Maplio is a travel itinerary planning tool built with Vue 3 and OpenStreetMap. It supports cloud synchronization (Firebase) and offline mode, allowing users to easily organize daily schedules, transportation methods, and location notes.

## ✨ Features

- 📅 **Itinerary Planning**: Drag-and-drop sorting with daily schedule management.
- 🗺️ **Map Integration**: Integrated OpenStreetMap with automatic location markers.
- ☁️ **Cloud Sync & Collaboration (Online Mode)**: Google Sign-In support with automatic data saving to Firebase Firestore for cross-device synchronization and real-time collaboration.
- ⚡ **Offline Mode**: Supports pure local operation, saving data to browser LocalStorage for privacy.
- 📱 **Responsive Design**: Optimized for both desktop and mobile devices.

> **⚠️ About Offline Mode**:
> This mode means **"Travel data is stored only on your device and not uploaded to the cloud"**, ensuring privacy.
> However, an **internet connection is still required** to load map tiles (OpenStreetMap).

---

## 🚀 User Guide

We offer multiple ways to use Maplio depending on your needs:

### 1. Try It Now

If you want to experience Maplio immediately without any setup:

- **🌐 Web Demo (Offline Mode Example)**
  Visit our offline demo hosted on Netlify:
  🔗 **[Go to Maplio Offline Demo](https://maplio-offline.netlify.app/#/)**

- **📂 Local File**
  Download the single HTML file to use locally:
    1.  Go to the **[Releases](../../releases)** page.
    2.  Download the latest `maplio-offline.zip` and unzip it.
    3.  Open `index.html` directly in Chrome, Edge or Safari.

### 2. Self-Host - Firebase (Recommended)

If you want **Cloud Sync & Collaboration features** (Online Mode) or want to host both Online and Offline versions, Firebase is the best choice.

- **Modes**: ✅ Online Mode (Cloud Sync), ✅ Offline Mode (Hosting)
- **Pros**: Google Sign-In support, cross-device sync, real-time collaboration, dual-version deployment.
- **Guide**: Please refer to the **[Project Setup & Deployment](#-project-setup--deployment-quick-start)** section below to set up Firebase and GitHub Actions.

### 3. Self-Host - Netlify (Quick)

If you only need **Offline Mode features**, Netlify is the fastest free solution.

- **Modes**: ✅ Offline Mode (Offline only)
- **Pros**: No coding required, mobile-friendly.
- **Steps**:
    1.  Download and unzip `maplio-offline.zip`.
    2.  Go to **[Netlify Drop](https://app.netlify.com/drop)**.
    3.  **Drag and Drop** the unzipped folder into the upload area.
    4.  Done! You now have a personal URL to access your map anywhere. 🚀
        > **💡 Tip**: After deployment, go to "Site settings" > "Change site name" to customize your URL (e.g., `my-trip-2024.netlify.app`) for easy sharing!

---

## 🚀 Project Setup & Deployment (Quick Start)

We recommend using **GitHub Actions** for automatic deployment. You only need to set up a Firebase project and GitHub Secrets to go live.

> 💡 **Tip**: We recommend **Forking** this repository to your own GitHub account first. All subsequent operations should be done in your forked repository.

### 1. Create a Firebase Project

To use cloud synchronization or host the offline version, you need to create a Firebase project first:

1.  Go to the [Firebase Console](https://console.firebase.google.com/) and add a new project.

2.  **Enable Authentication** (Required for Cloud Sync):
    - Go to "Build" > "Authentication" > "Sign-in method".
    - Enable the **Google** provider.

3.  **Create Firestore Database** (Required for Cloud Sync):
    - Go to "Build" > "Firestore Database".
    - Create a database (selecting a location close to your users, e.g., `asia-east1`, is recommended).
    - **Set Firestore Rules**:
      Copy the following rules to the Rules tab in the Firestore Console to ensure proper permission controls:

    ```javascript
    service cloud.firestore {
      match /databases/{database}/documents {
        match /trips/{tripId} {
          // 1. Allow any logged-in user to read a single trip (to check membership)
          allow get: if request.auth != null;

          // 2. Only members can list all trips
          allow list: if request.auth != null && request.auth.uid in resource.data.members;

          // 3. Allow updates:
          // A: Members can update the trip
          // B: Non-members can only add themselves to members (Join Trip feature)
          allow update: if request.auth != null && (
            request.auth.uid in resource.data.members ||
            request.resource.data.diff(resource.data).affectedKeys().hasOnly(['members'])
          );

          // 4. Other permissions (Create and Delete)
          allow create: if request.auth != null;
          allow delete: if request.auth != null && request.auth.uid in resource.data.members;
        }
      }
    }
    ```

4.  **Get Configuration (Config)**:
    - Go to "Project settings" (Gear icon) > "General".
    - Under the "Your apps" section, add a new Web App.
    - Keep the `firebaseConfig` information handy; you will need it in the next step.

### 2. Configure GitHub Secrets

To enable GitHub Actions for automatic deployment, set up environment variables in your forked repository:

Go to `Settings` > `Secrets and variables` > `Actions`, and add the following Secrets:

**Firebase Configuration (Values from the online Config in the previous step)**

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

**Firebase Configuration (Values from the offline Config in the previous step)**

- `VITE_FIREBASE_PROJECT_ID_OFFLINE`

**Firebase Service Account (For Deployment Permissions)**
You need to download the Service Account JSON file from Firebase Console (Project settings > Service accounts) and paste the entire file content into the Secret:

- `FIREBASE_SERVICE_ACCOUNT_MAPLIO` (For the Cloud version project)
- `FIREBASE_SERVICE_ACCOUNT_MAPLIO_OFFLINE` (For the Offline version project)

**Netlify Configuration (For automatic offline web deployment)**

- `NETLIFY_AUTH_TOKEN`: Personal Access Token from [Netlify User Settings](https://app.netlify.com/user/applications#personal-access-tokens).
- `NETLIFY_SITE_ID`: Your Netlify Site API ID (Found in Site configuration > General > Site details).

### 3. Trigger Deployment

The deployment workflow is configured for **manual triggering**. You can initiate the process directly from the GitHub interface without needing to run local Git commands:

1.  **Run Workflow**:
    - Navigate to the **Actions** tab of your GitHub repository.
    - Select **"Deploy to Firebase Hosting (Production)"** from the left sidebar.
    - Click the **"Run workflow"** dropdown button on the right to configure parameters:
        - **Branch**: Select the branch you wish to build (e.g., `main`).
        - **Deploy options**: Check the boxes to deploy to the Online and/or Offline environments.
        - **Version**: Enter a version name (e.g., `v1.0.0`). **(Required)**

---

## 🛠️ Local Development Guide

If you want to modify the code or test locally, follow these steps.

### 1. Environment Variables Setup

Create `.env` and `.env.offline` files in the project root directory and fill in the Firebase information (same values as GitHub Secrets):

- **`.env` (Cloud Mode)**

    ```bash
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    ```

- **`.env.offline` (Offline Mode)**

    ```bash
    VITE_APP_MODE=offline
    ```

### 2. Install and Run

Install dependencies and start the development server:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Once started, open `http://localhost:5173` in your browser to view the app.

---

## 📂 Project Structure

```
src/
├── components/     # Vue Components (Auth, Layout, Map, Planner, Trip)
├── stores/         # Pinia State Management (auth, theme, trip)
├── views/          # Pages (Home, Login, Planner)
├── utils/          # Utility Functions (date, map, string, theme)
├── services/       # Firebase Service Logic
├── i18n/           # i18n Settings (zh-TW, en-US)
└── firebase.js     # Firebase Initialization
```

## 📜 License

[MIT License](./LICENSE)
