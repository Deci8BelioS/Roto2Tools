// ============================================================
// main.js — Roto2Tools
// ============================================================
function init() {
    if (document.getElementById('fc-mobile-version-tag-for-monitoring') ||
        document.querySelector('.mobiletitlebottom')) {
        Roto2ToolsUtils.showToast('warning', 'No funciona en la versión móvil.', 'Roto2Tools');
        return;
    }
    if ([...document.querySelectorAll('a')].some(a => a.textContent.trim() === 'Nuevo diseño')) {
        Roto2ToolsUtils.showToast('info', 'No funciona en el foro clásico.', 'Roto2Tools');
        return;
    }
    if ([...document.querySelectorAll('strong')].some(s => s.textContent.trim() === 'ForoCoches Smilies')) return;
    if (!document.querySelector('#user-online-status')) {
        Roto2ToolsUtils.showToast('error', 'No funciona si no estás logueado.', 'Roto2Tools');
        return;
    }
    trackHistory();
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const fa = document.createElement('link');
        fa.rel = 'stylesheet';
        fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css';
        document.head.appendChild(fa);
    }
    const scriptVersion = typeof GM_info !== 'undefined' ? GM_info.script.version : '';
    const resaltarHilos = GM_getValue('resaltarHilos', []);
    const resaltarContactos = GM_getValue('resaltarContactos', []);
    const ocultarHilos = GM_getValue('ocultarHilos', []);
    const ocultarContactos = GM_getValue('ocultarContactos', []);
    try {
        Roto2ToolsMenu.create({
            initialResaltarHilos: resaltarHilos,
            initialOcultarHilos: ocultarHilos,
            initialResaltarContactos: resaltarContactos,
            initialOcultarContactos: ocultarContactos,
            scriptVersion,
            onSave({ resaltarHilos, ocultarHilos, resaltarContactos, ocultarContactos }) {
                GM_setValue('resaltarHilos', resaltarHilos);
                GM_setValue('ocultarHilos', ocultarHilos);
                GM_setValue('resaltarContactos', resaltarContactos);
                GM_setValue('ocultarContactos', ocultarContactos);
            },
        });
        syncRT2Theme();
    } catch (e) {
        console.error('Roto2Tools: Error al crear el menú.', e);
    }
    try {
        GM_addStyle(GM_getResourceText('bootstrapcss'));
        GM_addStyle(GM_getResourceText('Roto2Toolscss'));
        if (settings.cust0mMensajes) {
            GM_addStyle(GM_getResourceText('cust0mMensajes'));
        }
    } catch (e) {
        console.error('Roto2Tools: Error al cargar CSS.', e);
    }
    injectFavoriteButtonInThread();
    const opts = { ocultarHilos, resaltarHilos, ocultarContactos, resaltarContactos };
    try {
        Roto2ToolsProcessing.processThreads(opts);
        Roto2ToolsProcessing.processMessages(opts);
        Roto2ToolsProcessing.cleanupSeparators();
        Roto2ToolsProcessing.applyFinalStyles();
    } catch (e) {
        console.error('Roto2Tools: Error en procesamiento.', e);
        Roto2ToolsUtils.showToast('error', 'Error al procesar. Revisa la consola.', 'Roto2Tools');
    }
}
try {
    GM_addStyle(GM_getResourceText('toastcss'));
} catch (e) {
    console.error('Roto2Tools: Error al cargar toastcss.', e);
}
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    init();
} else {
    window.addEventListener('DOMContentLoaded', init);
}
window.addEventListener('storage', (e) => {
    if (['FORCE_LIGHT_MODE', 'FORCE_DARK_MODE', 'AUTO_DARK_MODE'].includes(e.key)) {
        syncRT2Theme();
    }
});
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (localStorage.getItem('AUTO_DARK_MODE') === 'true') {
        syncRT2Theme();
    }
});
