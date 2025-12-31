export const themes = {
    dark: {
        name: '深色',
        appClass: 'bg-slate-900 text-slate-100',
        headerClass: 'bg-slate-900/80 border-slate-800 text-white',
        sidebarClass: 'bg-slate-900 border-slate-800',
        cardClass: 'bg-slate-800/40 border-slate-700/20 text-slate-100',
        inputClass: 'bg-slate-800/50 border-transparent text-white focus:border-blue-500/50',

        // 搜尋與導航樣式
        searchIconClass: 'text-slate-600',
        loadingIconClass: 'text-blue-500',
        dropdownItemClass: 'hover:bg-slate-700 border-slate-700/50 text-slate-200',
        lineClass: 'bg-slate-800',
        transportSelectClass: 'bg-slate-800 text-blue-400 border-slate-700',
        navBtnClass:
            'bg-slate-800 border-slate-700 text-slate-500 hover:border-blue-500 hover:text-blue-400',

        // 對話框專用樣式 (SpotDialog)
        dialogOverlayClass: 'bg-slate-950/80 backdrop-blur-sm',
        dialogContainerClass: 'bg-slate-800 border-slate-700 text-slate-100 shadow-2xl',
        dialogTitleClass: 'text-blue-400',
        dialogLabelClass: 'text-slate-500',
        dialogInputClass:
            'bg-slate-900 border-slate-700 text-white placeholder-slate-600 focus:border-blue-500',
        dialogSecondaryBtnClass: 'bg-slate-700 text-blue-400 hover:bg-slate-600',
        dialogCancelBtnClass: 'text-slate-500 hover:text-slate-300',

        // 通用按鈕與標籤
        primaryBtnClass: 'bg-blue-600 shadow-blue-600/30 text-white',
        actionBtnClass:
            'bg-slate-900 text-slate-700 group-hover:bg-blue-600 group-hover:text-white',
        accentBtnClass: 'bg-indigo-600 text-white',
        badgeClass: 'bg-blue-500/10 text-blue-400',
        tabActiveClass: 'bg-blue-600 text-white shadow-blue-600/30',
        tabInactiveClass: 'bg-slate-800 text-slate-500 hover:text-slate-300',
        googleBtnClass: 'bg-white text-slate-900',
        secondaryBorderClass: 'border-slate-700',
        mapTile: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    },
    muji: {
        name: '淺色',
        appClass: 'bg-[#F7F6F2] text-stone-800',
        headerClass: 'bg-white border-stone-200 text-stone-800',
        sidebarClass: 'bg-white border-stone-200',
        cardClass: 'bg-white border-stone-200 text-stone-800 shadow-sm',
        inputClass: 'bg-white border-stone-200 text-stone-800 focus:border-stone-400',

        // 搜尋與導航樣式
        searchIconClass: 'text-stone-400',
        loadingIconClass: 'text-stone-600',
        dropdownItemClass: 'hover:bg-stone-50 border-stone-100 text-stone-800',
        lineClass: 'bg-stone-200',
        transportSelectClass: 'bg-stone-100 text-stone-600 border-stone-200',
        navBtnClass:
            'bg-stone-100 border-stone-200 text-stone-400 hover:border-stone-600 hover:text-stone-800',

        // 對話框專用樣式 (SpotDialog)
        dialogOverlayClass: 'bg-stone-900/20 backdrop-blur-sm',
        dialogContainerClass: 'bg-white border-stone-200 text-stone-800 shadow-2xl',
        dialogTitleClass: 'text-stone-800',
        dialogLabelClass: 'text-stone-400',
        dialogInputClass:
            'bg-stone-50 border-stone-100 text-stone-800 placeholder-stone-300 focus:border-stone-400',
        dialogSecondaryBtnClass: 'bg-stone-100 text-stone-600 hover:bg-stone-200',
        dialogCancelBtnClass: 'text-stone-400 hover:text-stone-600',

        // 通用按鈕與標籤
        primaryBtnClass: 'bg-stone-800 text-white shadow-stone-800/20',
        actionBtnClass:
            'bg-stone-200 text-stone-600 group-hover:bg-stone-800 group-hover:text-white',
        accentBtnClass: 'bg-stone-800 text-white',
        badgeClass: 'bg-stone-200 text-stone-600',
        tabActiveClass: 'bg-stone-800 text-white shadow-stone-800/20',
        tabInactiveClass: 'bg-stone-100 text-stone-400 hover:text-stone-600',
        googleBtnClass: 'bg-white text-stone-800 border border-stone-200',
        secondaryBorderClass: 'border-stone-200',
        mapTile: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
    }
}
