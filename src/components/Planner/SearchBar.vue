<template>
    <div class="relative">
        <div class="relative">
            <div
                class="absolute left-0 top-0 h-full w-12 flex items-center justify-center pointer-events-none z-10"
            >
                <i
                    v-if="!loading && !expanding"
                    :class="[
                        'fa-solid fa-magnifying-glass transition-colors',
                        themeConfig.searchIconClass
                    ]"
                ></i>
                <i
                    v-else
                    :class="[
                        'fa-solid fa-circle-notch fa-spin transition-colors',
                        themeConfig.loadingIconClass
                    ]"
                ></i>
            </div>

            <composition-input
                v-model="query"
                @enter="handleSearch"
                :placeholder="$t('planner.search_placeholder')"
                :class="[
                    'w-full pl-12 pr-12 py-4 rounded-2xl text-sm outline-none border transition-all duration-500 shadow-sm',
                    themeConfig.inputClass
                ]"
            />

            <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <template v-if="query || results?.length > 0">
                    <button
                        @click="clear"
                        :class="[
                            'w-8 h-8 flex items-center justify-center rounded-full transition-all hover:bg-black/5 active:scale-90',
                            themeConfig.searchIconClass
                        ]"
                    >
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </template>

                <template v-else>
                    <button
                        @click="handlePaste"
                        :class="[
                            'w-8 h-8 flex items-center justify-center rounded-full transition-all hover:bg-black/5 active:scale-90',
                            themeConfig.searchIconClass
                        ]"
                    >
                        <i class="fa-regular fa-clipboard"></i>
                    </button>
                </template>
            </div>
        </div>

        <div
            v-if="results.length > 0"
            :class="[
                'absolute w-full mt-2 border rounded-2xl shadow-2xl z-[100] overflow-hidden transition-colors duration-500',
                themeConfig.cardClass
            ]"
        >
            <button
                v-for="res in results"
                :key="res.place_id"
                @click="$emit('select', res)"
                :class="[
                    'w-full text-left px-4 py-4 border-b last:border-none transition-colors',
                    themeConfig.dropdownItemClass
                ]"
            >
                <div class="font-bold text-sm">
                    {{ res.display_name.split(',')[0] }}
                </div>
                <div class="text-[10px] opacity-50 truncate">
                    {{ res.display_name }}
                </div>
            </button>
        </div>
    </div>
</template>

<script setup>
import { parseGoogleMapUrl } from '@/utils/mapUtils'
import { ref } from 'vue'
import CompositionInput from '@/components/Common/CompositionInput.vue'

defineProps({
    results: Array,
    loading: Boolean,
    themeConfig: Object
})

const emit = defineEmits(['search', 'select', 'clear'])

const query = ref('')
const expanding = ref(false)

const GOOGLE_MAPS_HOSTNAMES = new Set([
    'maps.google.com',
    'maps.app.goo.gl',
    'goo.gl',
    'google.com',
    'www.google.com'
])

const isGoogleMapsUrl = (str) => {
    try {
        return GOOGLE_MAPS_HOSTNAMES.has(new URL(str).hostname)
    } catch {
        return false
    }
}

const handlePaste = async () => {
    try {
        const text = await navigator.clipboard.readText()
        query.value = text
        handleSearch()
    } catch (err) {
        console.error('Clipboard permission denied')
        clear()
    }
}

const searchOnGoogleMaps = () => {
    if (!query.value.trim()) {
        return
    }

    const keyword = encodeURIComponent(query.value)
    const url = `https://www.google.com/maps/search/?api=1&query=${keyword}`
    window.open(url, '_blank')
}

const handleSearch = async () => {
    const q = query.value.trim()
    if (!q) return

    // Already has parseable coords → pass through
    if (parseGoogleMapUrl(q)) {
        emit('search', q)
        return
    }

    // Short / full Google Maps URL — try backend expansion
    if (isGoogleMapsUrl(q)) {
        const backendUrl = localStorage.getItem('maplio_backend_url')
        const backendKey = localStorage.getItem('maplio_backend_key')
        if (backendUrl) {
            expanding.value = true
            try {
                const res = await fetch(`${backendUrl}/expandGoogleUrl`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': backendKey || ''
                    },
                    body: JSON.stringify({ url: q })
                })
                const data = await res.json()
                if (data.success && data.finalUrl) {
                    emit('search', data.finalUrl)
                    return
                }
            } catch {
                // network error — fall through to url_only
            } finally {
                expanding.value = false
            }
        }
        // No backend configured or expansion failed → url_only
        emit('search', q)
        return
    }

    // Plain keyword
    const provider = localStorage.getItem('maplio_search_provider') ?? 'google'
    if (provider === 'osm') {
        emit('search', q)
    } else {
        searchOnGoogleMaps()
    }
}

const clear = () => {
    query.value = ''
    emit('clear')
}

defineExpose({
    clear
})
</script>
