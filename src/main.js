import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import i18n from './i18n'

import '@/assets/main.css'
import faviconUrl from '@/assets/logos/favicon.svg'

const link = document.createElement('link')
link.rel = 'icon'
link.type = 'image/svg+xml'
link.href = faviconUrl
document.head.appendChild(link)

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')
