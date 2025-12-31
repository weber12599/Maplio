export const parseGoogleMapUrl = (url) => {
    const coordsMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    let name = ''
    if (coordsMatch) {
        const nameMatch = url.match(/\/place\/([^\/]+)\//)
        if (nameMatch) name = decodeURIComponent(nameMatch[1].replace(/\+/g, ' '))
        return {
            lat: parseFloat(coordsMatch[1]),
            lng: parseFloat(coordsMatch[2]),
            name: name || '地圖點'
        }
    }
    return null
}

export const parseClipboardCoords = (text) => {
    const regex = /\(?\s*(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)\s*\)?/
    const match = text.match(regex)
    return match ? { lat: parseFloat(match[1]), lng: parseFloat(match[2]) } : null
}

export const getNavUrl = (start, end, mode) => {
    if (!start.lat || !start.lng || !end.lat || !end.lng) return ''
    let url = `https://www.google.com/maps/dir/?api=1&origin=${start.lat},${start.lng}&destination=${end.lat},${end.lng}`
    const modes = { driving: 'driving', transit: 'transit', walking: 'walking' }
    if (modes[mode]) url += `&travelmode=${modes[mode]}`
    return url
}
