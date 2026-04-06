// ============================================================
// theme.js — Roto2Tools
// ============================================================

function detectFCTheme() {
    const forceLight = localStorage.getItem('FORCE_LIGHT_MODE') === 'true';
    const forceDark = localStorage.getItem('FORCE_DARK_MODE') === 'true';
    const autoDark = localStorage.getItem('AUTO_DARK_MODE') === 'true';
    if (forceLight) return 'light';
    if (forceDark) return 'dark';
    if (autoDark) return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    return 'dark';
}

function syncRT2Theme() {
    const modal = document.getElementById('roto2ToolsModal');
    if (!modal) return;
    modal.dataset.rt2Theme = detectFCTheme();
}
