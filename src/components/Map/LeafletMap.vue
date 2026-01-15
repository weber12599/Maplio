<template>
    <div :id="mapId" class="w-full h-full bg-slate-900 min-h-[220px]"></div>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { themes } from '../../utils/themeUtils'

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
        mapId: { type: String, required: true },
        currentTheme: String
    },
    data() {
        return {
            hasFittedBounds: false,
            renderTimeout: null,
            resizeTimeout: null,
            renderDelay: 300,
            resizeDelay: 200,
            resizeObserver: null
        }
    },
    created() {
        this.map = null
        this.markers = []
        this.tileLayer = null
    },
    watch: {
        spots: {
            deep: true,
            handler() {
                this.hasFittedBounds = false
                clearTimeout(this.renderTimeout)
                this.renderTimeout = setTimeout(() => {
                    this.renderMarkers()
                }, this.renderDelay)
            }
        },
        currentTheme(newTheme) {
            this.updateTileLayer(newTheme)
        }
    },
    mounted() {
        this.initMap()
    },
    beforeUnmount() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect()
            this.resizeObserver = null
        }

        if (this.renderTimeout) {
            clearTimeout(this.renderTimeout)
        }
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout)
        }

        if (this.map) {
            this.markers.forEach((m) => m.remove())
            this.markers = []

            if (this.tileLayer) {
                this.map.removeLayer(this.tileLayer)
            }

            this.map.remove()
            this.map = null
        }
    },
    methods: {
        initMap() {
            this.$nextTick(() => {
                if (this.map) return
                this.map = L.map(this.mapId, {
                    zoomControl: false,
                    tap: false,
                    fadeAnimation: true
                }).setView([25.03, 121.56], 13)
                this.updateTileLayer(this.currentTheme)

                this.resizeObserver = new ResizeObserver(() => {
                    if (this.map) {
                        clearTimeout(this.resizeTimeout)
                        this.resizeTimeout = setTimeout(() => {
                            this.map.invalidateSize()
                            if (!this.hasFittedBounds) {
                                this.adjustMapBounds()
                            }
                        }, this.resizeDelay)
                    }
                })
                this.resizeObserver.observe(this.$el)
                this.map.whenReady(() => this.renderMarkers())
            })
        },
        updateTileLayer(themeKey) {
            if (!this.map) return
            if (this.tileLayer) this.map.removeLayer(this.tileLayer)
            const tileUrl = themes[themeKey]?.mapTile || themes.dark.mapTile
            this.tileLayer = L.tileLayer(tileUrl, { updateWhenIdle: true, keepBuffer: 2 }).addTo(
                this.map
            )
        },
        renderMarkers() {
            if (!this.map) return
            this.markers.forEach((m) => this.map.removeLayer(m))
            this.markers = []

            this.spots.forEach((s, index) => {
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
                        .addTo(this.map)
                        .bindTooltip(s.name, {
                            offset: [0, -20],
                            direction: 'top',
                            opacity: 0.9
                        })

                    this.markers.push(m)
                }
            })
            this.adjustMapBounds()
        },
        adjustMapBounds() {
            if (!this.map || this.markers.length === 0) return

            if (this.map.getSize().x > 0) {
                const group = L.featureGroup(this.markers)
                this.map.flyToBounds(group.getBounds(), {
                    padding: [30, 30],
                    duration: 0.6,
                    maxZoom: 15
                })
                this.hasFittedBounds = true
            }
        }
    }
}
</script>
