<template>
    <div :id="mapId" ref="rootEl" class="w-full h-full bg-slate-900 min-h-[220px]"></div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { themes } from '../../utils/themeUtils'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

const props = defineProps({
    spots: {
        type: Array,
        default: () => []
    },
    mapId: {
        type: String,
        required: true
    },
    currentTheme: String
})

const rootEl = ref(null)

let map = null
let markers = []
let tileLayer = null
let resizeObserver = null

const hasFittedBounds = ref(false)
let renderTimeout = null
let resizeTimeout = null

const renderDelay = 300
const resizeDelay = 200

const updateTileLayer = (themeKey) => {
    if (!map) return
    if (tileLayer) map.removeLayer(tileLayer)

    const tileUrl = themes[themeKey]?.mapTile || themes.dark.mapTile

    tileLayer = L.tileLayer(tileUrl, {
        updateWhenIdle: true,
        keepBuffer: 2
    }).addTo(map)
}

const adjustMapBounds = () => {
    if (!map || markers.length === 0) return

    if (map.getSize().x > 0) {
        const group = L.featureGroup(markers)
        map.flyToBounds(group.getBounds(), {
            padding: [30, 30],
            duration: 0.6,
            maxZoom: 15
        })
        hasFittedBounds.value = true
    }
}

const renderMarkers = () => {
    if (!map) return

    markers.forEach((m) => map.removeLayer(m))
    markers = []

    props.spots.forEach((s, index) => {
        const lat = parseFloat(s.lat)
        const lng = parseFloat(s.lng)

        if (!isNaN(lat) && !isNaN(lng) && s.showOnMap !== false) {
            const numberIcon = L.divIcon({
                className: 'map-marker-icon',
                html: `
                    <div style="
                        background-color: #3b82f6;
                        color: white;
                        border: 2px solid white;
                        border-radius: 50%;
                        width: 24px;
                        height: 24px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        font-size: 14px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.4);
                    ">
                        ${index + 1}
                    </div>
                `,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
                popupAnchor: [0, -12]
            })

            const m = L.marker([lat, lng], { icon: numberIcon })
                .addTo(map)
                .bindTooltip(s.name, {
                    offset: [0, -20],
                    direction: 'top',
                    opacity: 0.9
                })

            markers.push(m)
        }
    })

    adjustMapBounds()
}

const initMap = async () => {
    await nextTick()
    if (map) return

    map = L.map(props.mapId, {
        zoomControl: false,
        tap: false,
        fadeAnimation: true
    }).setView([25.03, 121.56], 13)

    updateTileLayer(props.currentTheme)

    resizeObserver = new ResizeObserver(() => {
        if (map) {
            clearTimeout(resizeTimeout)
            resizeTimeout = setTimeout(() => {
                map.invalidateSize()
                if (!hasFittedBounds.value) {
                    adjustMapBounds()
                }
            }, resizeDelay)
        }
    })

    if (rootEl.value) {
        resizeObserver.observe(rootEl.value)
    }

    map.whenReady(() => renderMarkers())
}

watch(
    () => props.spots,
    () => {
        hasFittedBounds.value = false
        clearTimeout(renderTimeout)
        renderTimeout = setTimeout(() => {
            renderMarkers()
        }, renderDelay)
    },
    { deep: true }
)

watch(
    () => props.currentTheme,
    (newTheme) => {
        updateTileLayer(newTheme)
    }
)

onMounted(() => {
    initMap()
})

onUnmounted(() => {
    if (resizeObserver) {
        resizeObserver.disconnect()
        resizeObserver = null
    }

    if (renderTimeout) {
        clearTimeout(renderTimeout)
    }

    if (resizeTimeout) {
        clearTimeout(resizeTimeout)
    }

    if (map) {
        markers.forEach((m) => m.remove())
        markers = []

        if (tileLayer) {
            map.removeLayer(tileLayer)
        }

        map.remove()
        map = null
    }
})
</script>
