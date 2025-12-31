<template>
    <div :id="mapId" class="w-full h-full bg-slate-900 min-h-[220px]"></div>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

export default {
    name: 'LeafletMap',
    props: {
        spots: { type: Array, default: () => [] },
        mapId: { type: String, required: true }
    },
    data() {
        return {
            map: null,
            markers: [],
            resizeTimer: null
        }
    },
    watch: {
        spots: {
            deep: true,
            handler() {
                this.renderMarkers()
            }
        }
    },
    mounted() {
        this.initMap()
        window.addEventListener('resize', this.handleResize)
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.handleResize)
        if (this.map) this.map.remove()
    },
    methods: {
        initMap() {
            this.$nextTick(() => {
                if (this.map) return

                this.map = L.map(this.mapId, {
                    zoomControl: false,
                    attributionControl: false,
                    preferCanvas: true,
                    tap: false,
                    fadeAnimation: true,
                    zoomAnimation: true
                }).setView([25.03, 121.56], 13)

                L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                    updateWhenIdle: true,
                    keepBuffer: 2
                }).addTo(this.map)

                this.map.whenReady(() => {
                    // 監聽容器變動，一旦從隱藏變顯示就自動重繪
                    const ro = new ResizeObserver(() => {
                        if (this.map) this.map.invalidateSize()
                    })
                    ro.observe(this.$el)
                    this.renderMarkers()
                })
            })
        },

        renderMarkers() {
            if (!this.map) return

            this.markers.forEach((m) => this.map.removeLayer(m))
            this.markers = []

            const latlngs = []
            this.spots.forEach((s) => {
                const lat = parseFloat(s.lat)
                const lng = parseFloat(s.lng)

                // 修正：必須座標有效且 showOnMap 不為 false 才渲染
                if (!isNaN(lat) && !isNaN(lng) && s.showOnMap !== false) {
                    const m = L.marker([lat, lng])
                        .addTo(this.map)
                        .bindPopup(`<b style="color:#1e1b4b">${s.name}</b>`)
                    this.markers.push(m)
                    latlngs.push([lat, lng])
                }
            })

            if (latlngs.length > 0) {
                // 修正：檢查容器尺寸，若寬高為 0 則不執行 flyToBounds 以防止 NaN 錯誤
                const size = this.map.getSize()
                if (size.x > 0 && size.y > 0) {
                    const isMobile = window.innerWidth < 768
                    try {
                        this.map.flyToBounds(L.latLngBounds(latlngs), {
                            padding: isMobile ? [30, 30] : [60, 60],
                            duration: 0.6,
                            maxZoom: 15
                        })
                    } catch (e) {
                        console.warn('Map animation error ignored:', e)
                    }
                }
            }
        },

        handleResize() {
            clearTimeout(this.resizeTimer)
            this.resizeTimer = setTimeout(() => {
                if (this.map) this.map.invalidateSize({ animate: true })
            }, 250)
        }
    }
}
</script>
