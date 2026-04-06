// ============================================================
// settings.js — Roto2Tools
// ============================================================

const DEFAULT_SETTINGS = {
    cust0mMensajes: true,
    expandirLayout: true,
    registrarHistorial: true,
    botonFavoritoHilo: true,
    ocultarIdSidebar: false,
    limiteHistorial: 100,
    colores: {
        hideContact: '#FF2626',
        highlightContact: '#2FC726',
        highlightThread: '#EDD40E',
        hideThread: '#FD5D4D',
        info: '#589cfc',
    },
};

const _saved = GM_getValue('rt2_settings', {});
const settings = {
    ...DEFAULT_SETTINGS,
    ..._saved,
    colores: { ...DEFAULT_SETTINGS.colores, ...(_saved.colores || {}) },
};

const COLORS = settings.colores;
