import { getDayDate } from './dateUtils'

// Escape user-provided text so it can't break the generated HTML layout.
const escapeHtml = (value) => {
    if (value === null || value === undefined) return ''
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

// Escape, then turn newlines into <br> so multi-line notes keep their breaks.
const escapeMultiline = (value) => escapeHtml(value).replace(/\n/g, '<br>')

const formatTimeRange = (start, end) => {
    if (start && end) return `${start} – ${end}`
    return start || end || ''
}

const buildSpotHtml = (spot, index, t) => {
    const name = escapeHtml(spot.name || t('planner.unnamed_spot'))
    const time = formatTimeRange(spot.timeStart, spot.timeEnd)
    const notes = spot.notes ? `<div class="spot-notes">${escapeMultiline(spot.notes)}</div>` : ''

    const transportMode = spot.travelMode ? t(`planner.transport.${spot.travelMode}`) : ''
    const transportTime = formatTimeRange(spot.transStart, spot.transEnd)
    const transportNotes = spot.transportNotes ? escapeHtml(spot.transportNotes) : ''
    const transportParts = [transportMode, transportTime, transportNotes].filter(Boolean)
    const transport = transportParts.length
        ? `<div class="spot-transport">→ ${transportParts.map(escapeHtml).join(' · ')}</div>`
        : ''

    return `
        <li class="spot">
            <div class="spot-marker">${index + 1}</div>
            <div class="spot-body">
                <div class="spot-head">
                    <span class="spot-name">${name}</span>
                    ${time ? `<span class="spot-time">${escapeHtml(time)}</span>` : ''}
                </div>
                ${notes}
                ${transport}
            </div>
        </li>`
}

const buildTodosHtml = (todos, t) => {
    if (!todos || !todos.length) return ''
    const items = todos
        .map((todo) => {
            const indent = todo.level === 1 ? ' todo-sub' : ''
            const mark = todo.done ? '☑' : '☐'
            return `<li class="todo${indent}"><span class="todo-mark">${mark}</span>${escapeHtml(
                todo.text
            )}</li>`
        })
        .join('')
    return `
        <div class="block">
            <h3 class="block-title">${escapeHtml(t('planner.todo_list'))}</h3>
            <ul class="todos">${items}</ul>
        </div>`
}

const buildDayHtml = (trip, dayIndex, getActivePlan, t) => {
    const day = trip.itinerary[dayIndex]
    const plan = getActivePlan(dayIndex)
    const spots = plan?.spots || []
    const dateLabel = getDayDate(trip.startDate, dayIndex)

    const summary = day?.summary
        ? `<div class="block">
                <h3 class="block-title">${escapeHtml(t('planner.day_summary'))}</h3>
                <div class="summary">${escapeMultiline(day.summary)}</div>
           </div>`
        : ''

    const spotsHtml = spots.length
        ? `<ul class="spots">${spots.map((spot, i) => buildSpotHtml(spot, i, t)).join('')}</ul>`
        : `<div class="empty">${escapeHtml(t('planner.empty_day_hint'))}</div>`

    return `
        <section class="day">
            <header class="day-head">
                <span class="day-num">${escapeHtml(t('planner.day_n', { n: dayIndex + 1 }))}</span>
                ${dateLabel ? `<span class="day-date">${escapeHtml(dateLabel)}</span>` : ''}
            </header>
            ${summary}
            ${spotsHtml}
            ${buildTodosHtml(day?.todos, t)}
        </section>`
}

const buildDocument = (trip, getActivePlan, t) => {
    const totalDays = trip.itinerary?.length || 0
    const firstDate = getDayDate(trip.startDate, 0)
    const lastDate = totalDays > 0 ? getDayDate(trip.startDate, totalDays - 1) : ''
    const dateRange = firstDate && lastDate ? `${firstDate} – ${lastDate}` : firstDate || ''

    const daysHtml = Array.from({ length: totalDays }, (_, i) =>
        buildDayHtml(trip, i, getActivePlan, t)
    ).join('')

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${escapeHtml(trip.name || t('export.title'))}</title>
<style>
    @page { margin: 16mm; }
    * { box-sizing: border-box; }
    body {
        font-family: -apple-system, "Helvetica Neue", "PingFang TC", "Microsoft JhengHei", sans-serif;
        color: #1c1917;
        margin: 0;
        line-height: 1.5;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
    .cover { text-align: center; padding: 24px 0 32px; border-bottom: 2px solid #1c1917; margin-bottom: 24px; }
    .cover h1 { font-size: 28px; margin: 0 0 8px; }
    .cover .meta { font-size: 14px; color: #57534e; }
    .day { page-break-inside: avoid; margin-bottom: 28px; }
    .day-head { display: flex; align-items: baseline; gap: 12px; border-bottom: 1px solid #d6d3d1; padding-bottom: 6px; margin-bottom: 12px; }
    .day-num { font-size: 18px; font-weight: 700; }
    .day-date { font-size: 13px; color: #78716c; }
    .block { margin: 10px 0 14px; }
    .block-title { font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: #78716c; margin: 0 0 4px; }
    .summary { font-size: 13px; white-space: normal; }
    .spots { list-style: none; margin: 0; padding: 0; }
    .spot { display: flex; gap: 10px; padding: 8px 0; border-bottom: 1px dashed #e7e5e4; page-break-inside: avoid; }
    .spot-marker { flex: 0 0 22px; height: 22px; border-radius: 50%; background: #1c1917; color: #fff; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
    .spot-body { flex: 1; }
    .spot-head { display: flex; justify-content: space-between; gap: 12px; align-items: baseline; }
    .spot-name { font-size: 15px; font-weight: 600; }
    .spot-time { font-size: 12px; color: #78716c; white-space: nowrap; }
    .spot-notes { font-size: 12px; color: #44403c; margin-top: 3px; }
    .spot-transport { font-size: 12px; color: #57534e; margin-top: 4px; font-style: italic; }
    .todos { list-style: none; margin: 0; padding: 0; }
    .todo { font-size: 13px; padding: 2px 0; }
    .todo-sub { padding-left: 22px; }
    .todo-mark { margin-right: 6px; }
    .empty { font-size: 13px; color: #a8a29e; font-style: italic; }
</style>
</head>
<body>
    <div class="cover">
        <h1>${escapeHtml(trip.name || t('export.title'))}</h1>
        ${
            dateRange
                ? `<div class="meta">${escapeHtml(dateRange)} · ${escapeHtml(
                      t('export.day_count', { count: totalDays })
                  )}</div>`
                : ''
        }
    </div>
    ${daysHtml}
</body>
</html>`
}

/**
 * Render the given trip into a printable travel booklet and open the browser
 * print dialog (where the user can "Save as PDF").
 *
 * Uses a hidden iframe with a self-contained HTML document so the print output
 * is isolated from the app's complex SPA layout and works in offline single-file
 * (file://) mode.
 *
 * @param {object} trip   The current trip (tripStore.currentTrip).
 * @param {object} deps   { t, getActivePlan } — i18n translate fn and the store's plan resolver.
 */
export const exportTripToPdf = (trip, { t, getActivePlan }) => {
    if (!trip) return

    const html = buildDocument(trip, getActivePlan, t)

    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = '0'
    document.body.appendChild(iframe)

    const cleanup = () => {
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe)
    }

    const doc = iframe.contentWindow.document
    doc.open()
    doc.write(html)
    doc.close()

    // Wait for the iframe document (and fonts) to be ready before printing.
    const triggerPrint = () => {
        const win = iframe.contentWindow
        win.focus()
        win.onafterprint = cleanup
        win.print()
        // Fallback cleanup in case onafterprint never fires (some browsers).
        setTimeout(cleanup, 60000)
    }

    if (iframe.contentWindow.document.readyState === 'complete') {
        triggerPrint()
    } else {
        iframe.onload = triggerPrint
    }
}
