// ============================================================
// history.js — Roto2Tools
// ============================================================

function trackHistory() {
    if (!settings.registrarHistorial) return;
    const threadData = Roto2ToolsUtils.getRealThreadData();
    if (!threadData) return;
    const { id, type } = threadData;
    let title = document.title.replace(' - ForoCoches', '').trim();
    const h1 = document.querySelector('.pull-left > h1') || document.querySelector('h1');
    if (h1?.innerText) title = h1.innerText.trim();
    const limit = Math.max(10, Math.min(500, Number(settings.limiteHistorial) || 100));
    let history = GM_getValue('rt2_history', []).filter(item => item.id !== id);
    history.unshift({ id, title, type, date: new Date().toLocaleString() });
    if (history.length > limit) history = history.slice(0, limit);
    GM_setValue('rt2_history', history);
}
