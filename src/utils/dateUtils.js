export const getDayDate = (startDate, dayIndex) => {
    if (!startDate) return ''
    const date = new Date(startDate)
    date.setDate(date.getDate() + dayIndex)
    const weekDays = ['日', '一', '二', '三', '四', '五', '六']
    const dayName = weekDays[date.getDay()]
    return `${date.getMonth() + 1}/${date.getDate()} (${dayName})`
}
