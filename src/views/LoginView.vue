<template>
    <div
        :class="[
            'h-dvh w-full flex items-center justify-center transition-colors duration-500',
            activeThemeConfig.appClass
        ]"
    >
        <LoginScreen
            :themeConfig="activeThemeConfig"
            @login="handleLogin"
            @demo="handleDemo"
            :appVersion="appVersion"
        />
    </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useRouter, useRoute } from 'vue-router'
import LoginScreen from '../components/Auth/LoginScreen.vue'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const { activeThemeConfig } = storeToRefs(themeStore)
const appVersion = import.meta.env.VITE_APP_VERSION || 'v0.0.0'

const redirectAfterLogin = () => {
    const redirectPath = route.query.redirect || '/'
    router.push(redirectPath)
}

const handleLogin = async () => {
    await authStore.loginGoogle()
    redirectAfterLogin()
}

const handleDemo = () => {
    authStore.enterDemoMode()
    redirectAfterLogin()
}
</script>
