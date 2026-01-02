import { defineStore } from 'pinia'
import { ref } from 'vue'
import { auth, googleProvider } from '../firebase'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)
    const isDemoMode = ref(false)
    const isAuthReady = ref(false)

    // 用變數儲存正在進行中的初始化 Promise，避免重複建立
    let initPromise = null

    function initAuthListener() {
        // 1. 如果已經準備好了，直接回傳當前使用者
        if (isAuthReady.value) {
            return Promise.resolve(user.value)
        }

        // 2. 如果正在初始化中（Promise 還沒 resolve），直接回傳同一個 Promise
        if (initPromise) {
            return initPromise
        }

        // 3. 建立唯一的初始化 Promise
        initPromise = new Promise((resolve) => {
            onAuthStateChanged(auth, (currentUser) => {
                user.value = currentUser

                // 只有第一次觸發時，改變狀態並 resolve
                if (!isAuthReady.value) {
                    isAuthReady.value = true
                    resolve(currentUser)
                }

                // 注意：我們保留這個監聽器，因為它會負責後續的登入/登出狀態同步
            })
        })

        return initPromise
    }

    async function loginGoogle() {
        try {
            const result = await signInWithPopup(auth, googleProvider)
            user.value = result.user
            isDemoMode.value = false
        } catch (error) {
            console.error('Login failed:', error)
        }
    }

    async function logout() {
        await signOut(auth)
        user.value = null
        isDemoMode.value = false
        // 登出後，我們不重置 isAuthReady，因為應用程式仍然與 Firebase 保持連線
    }

    function enterDemoMode() {
        isDemoMode.value = true
        user.value = {
            uid: 'demo-user',
            displayName: 'Demo User',
            email: 'demo@example.com',
            photoURL: null
        }
    }

    return {
        user,
        isDemoMode,
        isAuthReady,
        initAuthListener,
        loginGoogle,
        logout,
        enterDemoMode
    }
})
