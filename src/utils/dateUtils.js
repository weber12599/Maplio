import i18n from '../i18n'

export const getDayDate = (startDate, dayIndex) => {
    if (!startDate) return ''
    const [year, month, day] = startDate.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    date.setDate(date.getDate() + dayIndex)

    const currentLocale = i18n.global.locale.value
    const weekdayFormat = currentLocale === 'zh-TW' ? 'narrow' : 'short'

    const dayName = date.toLocaleDateString(currentLocale, { weekday: weekdayFormat })
    return `${date.getMonth() + 1}/${date.getDate()} (${dayName})`
}
