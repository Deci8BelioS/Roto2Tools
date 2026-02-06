// ==UserScript==
// @id              Roto2Tools DEV
// @name            Roto2Tools DEV
// @namespace       Roto2Tools DEV
// @author          DeciBelioS
// @homepage        https://github.com/Deci8BelioS/Roto2Tools/
// @description     Script para Forocoches que oculta hilos o los resalta con las palabras añadidas por el usuario
// @icon            https://raw.githubusercontent.com/Deci8BelioS/Roto2Tools/dev/resources/img/icon-48x48.png
// @icon64          https://raw.githubusercontent.com/Deci8BelioS/Roto2Tools/dev/resources/img/icon-64x64.png
// @updateURL       https://raw.githubusercontent.com/Deci8BelioS/Roto2Tools/dev/Roto2Tools-dev.user.js
// @version         1.7.0d
// @encoding        UTF-8
// @match           *://www.forocoches.com/*
// @match           *://forocoches.com/*
// @grant           GM_setValue
// @grant           GM_getValue
// @grant           GM_deleteValue
// @grant           GM_xmlhttpRequest
// @grant           GM_addStyle
// @grant           GM_getResourceText
// @grant           GM_getResourceURL
// @grant           GM_getMetadata
// @run-at          document-end
// @require         https://code.jquery.com/jquery-3.7.1.min.js
// @require         https://cdn.jsdelivr.net/npm/bootstrap@5/dist/js/bootstrap.min.js
// @require         https://raw.githubusercontent.com/Deci8BelioS/Roto2Tools/dev/resources/require/toastr.js
// @require         https://unpkg.com/@popperjs/core@2
// @require         https://unpkg.com/tippy.js@6
// --- Modulos Roto2Tools ---
// @require         https://raw.githubusercontent.com/Deci8BelioS/Roto2Tools/refs/heads/dev/script/utils.js
// @require         https://raw.githubusercontent.com/Deci8BelioS/Roto2Tools/refs/heads/dev/script/menu.js
// @require         https://raw.githubusercontent.com/Deci8BelioS/Roto2Tools/refs/heads/dev/script/processing.js
// --- Recursos CSS ---
// @resource        toastrcss https://raw.githubusercontent.com/Deci8BelioS/Roto2Tools/refs/heads/dev-1/resources/require/toastr.min.css
// @resource        tippycss https://unpkg.com/tippy.js@6/dist/tippy.css
// @resource        scalecss https://unpkg.com/tippy.js@6/animations/scale.css
// @resource        bootstrapcss https://raw.githubusercontent.com/Deci8BelioS/Roto2Tools/refs/heads/dev-1/resources/require/bootstrapcss.css
// @resource        Roto2Toolscss https://raw.githubusercontent.com/Deci8BelioS/Roto2Tools/refs/heads/dev-1/resources/require/Roto2Toolscss.css
// ==/UserScript==

(function(window, $, toastr, Roto2ToolsUtils, Roto2ToolsMenu, Roto2ToolsProcessing) {
    'use strict';
    if (!$) { console.error("Roto2Tools: jQuery no cargado."); return; }
    if (!toastr) { console.error("Roto2Tools: Toastr no cargado."); return; }
    if (!Roto2ToolsUtils) { console.error("Roto2Tools: Módulo Utils no cargado."); return; }
    if (!Roto2ToolsMenu) { console.error("Roto2Tools: Módulo Menu no cargado."); return; }
    if (!Roto2ToolsProcessing) { console.error("Roto2Tools: Módulo Processing no cargado."); return; }
    try {
        const Roto2Toolscss = GM_getResourceText("Roto2Toolscss"); GM_addStyle(Roto2Toolscss);
        const bootstrapcss = GM_getResourceText("bootstrapcss"); GM_addStyle(bootstrapcss);
        const toastrcss = GM_getResourceText("toastrcss"); GM_addStyle(toastrcss);
        const tippycss = GM_getResourceText("tippycss"); GM_addStyle(tippycss);
        const scalecss = GM_getResourceText("scalecss"); GM_addStyle(scalecss);
    } catch (e) {
        console.error("Roto2Tools: Error al cargar recursos CSS.", e);
        alert("Roto2Tools: No se pudieron cargar algunos estilos. La apariencia puede ser incorrecta.");
    }
    toastr.options = {closeButton: false, debug: false, newestOnTop: false, progressBar: true, positionClass: "toast-bottom-right", preventDuplicates: true, onclick: null, showDuration: "350", hideDuration: "1000", timeOut: "6000", extendedTimeOut: "2000", showEasing: "swing", hideEasing: "linear", showMethod: "fadeIn", hideMethod: "fadeOut"};
    const telefono = $("#fc-mobile-version-tag-for-monitoring");
    const telefonoClasico = $(".mobiletitlebottom");
    const clasico = $("a:contains('Nuevo diseño')");
    const listaIconosFC = $("strong:contains('ForoCoches Smilies')");
    const noShur = $("#user-online-status");
    const scriptVersion = GM_info.script.version;
    if (telefono.length || telefonoClasico.length) { toastr["warning"](`No funciona en telefonos <img src="https://forocoches.com/foro/images/smilies/smash2.gif">`, `Roto2Tools`); return; }
    if (clasico.length) { toastr["info"](`No funciona en el foro clasico <img src="https://forocoches.com/foro/images/smilies/eaea.gif">`, `Roto2Tools`); return; }
    if (listaIconosFC.length) { return; }
    if (!noShur.length) { toastr["error"](`No funciona si no estas logeado`, `Roto2Tools <img src="https://forocoches.com/foro/images/smilies/nono.gif">`); return; }
    let resaltarHilos = GM_getValue("resaltarHilos", []);
    let resaltarContactos = GM_getValue("resaltarContactos", []);
    let ocultarHilos = GM_getValue("ocultarHilos", []);
    let ocultarContactos = GM_getValue("ocultarContactos", []);
    let menuInputRefs = {};
    function saveDataAndUpdate(newData) {
        GM_setValue("ocultarHilos", newData.ocultarHilos);
        GM_setValue("resaltarHilos", newData.resaltarHilos);
        GM_setValue("ocultarContactos", newData.ocultarContactos);
        GM_setValue("resaltarContactos", newData.resaltarContactos);
        ocultarHilos = newData.ocultarHilos;
        resaltarHilos = newData.resaltarHilos;
        ocultarContactos = newData.ocultarContactos;
        resaltarContactos = newData.resaltarContactos;
        console.log("Roto2Tools: Datos guardados. Recarga la página para ver todos los cambios.");
        toastr.info("Recarga la página para aplicar todos los cambios guardados.", "Roto2Tools");
    }
    function runProcessingLogic() {
        const processingOptions = {ocultarHilos, resaltarHilos, ocultarContactos, resaltarContactos};
        Roto2ToolsProcessing.processThreads(processingOptions);
        Roto2ToolsProcessing.processMessages(processingOptions);
        Roto2ToolsProcessing.cleanupSeparators();
        Roto2ToolsProcessing.applyFinalStyles();
    }
    try {
        menuInputRefs = Roto2ToolsMenu.create({initialResaltarHilos: resaltarHilos, initialOcultarHilos: ocultarHilos, initialResaltarContactos: resaltarContactos, initialOcultarContactos: ocultarContactos, onSave: saveDataAndUpdate, scriptVersion: scriptVersion});
        runProcessingLogic();
    } catch (e) {
        console.error("Roto2Tools: Error durante la inicialización o procesamiento.", e);
        toastr.error("Ocurrió un error al iniciar Roto2Tools. Revisa la consola.", "Error Roto2Tools");
    }
})(window, window.jQuery, window.toastr, window.Roto2ToolsUtils, window.Roto2ToolsMenu, window.Roto2ToolsProcessing);
