// ==UserScript==
// @name         Roto2Tools Menu UI
// @namespace    Roto2Tools
// @version      1.0
// @description  UI creation for Roto2Tools Menu
// @author       DeciBelioS
// @grant        none
// ==/UserScript==
// NOTE: This header is only for identification/clarity. NOT needed when used via @require.

(function(window, $, bootstrap, toastr, tippy, Utils) {
    'use strict';
    if (!$) { console.error("Roto2Tools Menu: jQuery no está disponible."); return; }
    if (!bootstrap) { console.error("Roto2Tools Menu: Bootstrap no está disponible."); return; }
    if (!toastr) { console.error("Roto2Tools Menu: Toastr no está disponible."); return; }
    if (!tippy) { console.error("Roto2Tools Menu: Tippy no está disponible."); return; }
    if (!Utils) { console.error("Roto2Tools Menu: Roto2ToolsUtils no está disponible."); return; }
    function createTagInputComponent(placeholder, initialValues = []) {
        const componentId = `tags-${Math.random().toString(36).substring(2, 9)}`;
        let currentTags = new Set(Array.isArray(initialValues) ? initialValues.map(t => String(t).trim()).filter(Boolean) : []);
        const container = $('<div>').addClass('tag-input-container').attr('id', `container-${componentId}`);
        const tagsDisplay = $('<div>').addClass('tags-display');
        const controls = $('<div>').addClass('tag-input-controls');
        const input = $('<input>').attr('type', 'text').attr('placeholder', placeholder).attr('id', `input-${componentId}`);
        const addButton = $('<button>').attr('type', 'button').text('Añadir');
        function renderTag(text) {
            const tag = $('<span>').addClass('tag').data('value', text);
            const tagText = $('<span>').text(text);
            const deleteBtn = $('<span>').addClass('delete-tag').html('×');
            deleteBtn.on('click', function() { const valueToRemove = $(this).closest('.tag').data('value'); currentTags.delete(valueToRemove); $(this).closest('.tag').remove(); });
            tag.append(tagText).append(deleteBtn);
            tagsDisplay.append(tag);
            tagsDisplay.scrollTop(tagsDisplay[0].scrollHeight);
        }
        function addTagFromInput() {
            const value = input.val().trim();
            if (value && !currentTags.has(value)) { currentTags.add(value); renderTag(value); input.val(''); } else if (currentTags.has(value)) { toastr.warning(`"${value}" ya está en la lista.`, `Roto2Tools`); }
            input.focus();
        }
        addButton.on('click', addTagFromInput);
        input.on('keypress', function(e) { if (e.key === 'Enter') { e.preventDefault(); addTagFromInput(); }});
        function setValues(newValues) {
            if (!Array.isArray(newValues)) { console.error("setValues espera un array:", newValues); toastr.error("Error interno al importar: los datos no son un array.", "Roto2Tools"); return; }
            currentTags.clear();
            tagsDisplay.empty();
            newValues.forEach(value => {
                const trimmedValue = String(value).trim();
                if (trimmedValue && !currentTags.has(trimmedValue)) { currentTags.add(trimmedValue); renderTag(trimmedValue); }});
        }
        currentTags.forEach(tagText => renderTag(tagText));
        controls.append(input).append(addButton);
        container.append(tagsDisplay).append(controls);
        return { element: container, getValues: function() { return Array.from(currentTags); }, setValues: setValues };
    }
    window.Roto2ToolsMenu = {
        create: function(options) {
            const {initialResaltarHilos, initialOcultarHilos, initialResaltarContactos, initialOcultarContactos, onSave, scriptVersion} = options;
            const Roto2ToolsContainer = $("#searchform-desktop");
            const menuBtn = $("<button>").html("Roto2Tools").css({"background-color": "#FF5A4B", color: "white", padding: "10px 20px", "font-weight": "bold", "text-shadow": "1px 1px 4px #000", "border-radius": "6px", cursor: "pointer", "margin-left": "5px", "box-shadow": "0px 2px 4px #000000", transition: "transform 0.3s, box-shadow 0.3s"});
            Utils.applyButtonInteractionEffects(menuBtn);
            if (Roto2ToolsContainer.length > 0) { Roto2ToolsContainer.after(menuBtn); } else { $('body').prepend(menuBtn.css({'position': 'fixed', 'top': '10px', 'right': '10px', 'z-index': '9999'})); }
            const resaltarHilosComp = createTagInputComponent("Añadir palabra a resaltar...", initialResaltarHilos);
            const ocultarHilosComp = createTagInputComponent("Añadir palabra a ocultar...", initialOcultarHilos);
            const ocultarContactosComp = createTagInputComponent("Añadir usuario a ocultar (sin @)...", initialOcultarContactos);
            const resaltarContactosComp = createTagInputComponent("Añadir usuario a resaltar (sin @)...", initialResaltarContactos);
            const exportBtn = $('<button>').addClass('backup-section export-button').text('Exportar Listas');
            const importBtn = $('<button>').addClass('backup-section import-button').text('Importar Listas');
            const importFileInput = $('<input>').attr('type', 'file').attr('id', 'import-file-input').attr('accept', '.json');
            const backupSection = $('<div>').addClass('backup-section').append(exportBtn).append(importBtn).append(importFileInput);
            const acercaRoto2Tools = $("<div>")
                .addClass("tab-about")
                .html(
                    `<div style="text-align: center;">
                        <p>Script para Forocoches que oculta hilos o los resalta con las palabras/usuarios añadidos</p>
                        <div style="text-align: right; margin-top: 15px;">
                        <strong><a href="https://github.com/Deci8BelioS/Roto2Tools/" target="_blank" style="color: #FF8C00;">Github Roto2Tools</a></strong>
                        <br>
                        <span><strong>Versión instalada:</strong> ${scriptVersion}</span>
                        </div>
                    </div>`
                )
                .css({ color: "#eee", "margin-top": "10px" })
                .append(backupSection);
            const tabsConfig = [
                { id: "resaltar-hilos", title: "Resaltar hilos", color: "rgb(237, 212, 14)", content: resaltarHilosComp.element, active: true },
                { id: "ocultar-hilos", title: "Ocultar hilos", color: "rgb(253, 93, 77)", content: ocultarHilosComp.element },
                { id: "ocultar-users", title: "Ocultar usuarios", color: "rgb(255, 38, 38)", content: ocultarContactosComp.element },
                { id: "resaltar-users", title: "Resaltar usuarios", color: "rgb(47, 199, 38)", content: resaltarContactosComp.element },
                { id: "about", title: "Acerca de", color: "rgb(200, 200, 200)", content: acercaRoto2Tools }
            ];
            const tabList = $("<ul>").addClass("nav nav-tabs").attr("id", "roto2ToolsTab").attr("role", "tablist");
            const tabContent = $("<div>").addClass("tab-content").attr("id", "roto2ToolsTabContent");
            tabsConfig.forEach((tab, index) => {
                const link = $("<a>").addClass(`nav-link ${tab.active ? 'active' : ''}`).attr("id", `${tab.id}-tab`).attr("data-bs-toggle", "tab").attr("data-bs-target", `#${tab.id}`).attr("role", "tab").attr("aria-controls", tab.id).attr("aria-selected", tab.active ? "true" : "false").html(tab.title).css({ "color": tab.color, "font-weight": "bold", "text-align": "center", ...(tab.active && {"background-color": "#333", "border-color": "#444 #444 #333"})}).hover(function () { if (!$(this).hasClass('active')) $(this).css({"background-color": "#2a2a2a", "border-color": "#444 #444 transparent"}); }, function () { if (!$(this).hasClass('active')) $(this).css({"background-color": "", "border-color": "transparent"}); });
                link.on('show.bs.tab', function() { $(this).css({"background-color": "#333", "border-color": "#444 #444 #333"}); if(tab.id === 'about') $(this).css({"color": tab.color}); });
                link.on('hide.bs.tab', function() { $(this).css({"background-color": "", "border-color": "transparent", "color": tab.color}); });
                if (tab.active) { link.css("color", tab.color); }
                tabList.append($("<li>").addClass("nav-item").attr("role", "presentation").append(link));
                const pane = $("<div>").addClass(`tab-pane fade ${tab.active ? 'show active' : ''}`).attr("id", tab.id).attr("role", "tabpanel").attr("aria-labelledby", `${tab.id}-tab`).append(tab.content);
                tabContent.append(pane);
            });
            const guardarlistasBtn = $("<button>").text("Guardar cambios").attr("type", "button").attr("data-bs-dismiss", "modal").css({"background-color": "rgb(255, 90, 75)", color: "white", "font-weight": "bold", padding: "10px 20px", "border-radius": "6px", "text-shadow": "rgb(0, 0, 0) 1px 1px 4px", cursor: "pointer", "box-shadow": "0px 2px 4px #000000", transition: "transform 0.3s, box-shadow 0.3s", "border": "none"});
            Utils.applyButtonInteractionEffects(guardarlistasBtn);
            const cerrarBtn = $("<button>").attr("type", "button").attr("data-bs-dismiss", "modal").html("Cerrar").css({bottom: "20px", padding: "10px 20px", "border-radius": "6px", "text-shadow": "rgb(0, 0, 0) 1px 1px 4px", "background-color": "rgb(85, 85, 85)", color: "white", cursor: "pointer", "box-shadow": "0px 2px 4px #000000", transition: "transform 0.3s, box-shadow 0.3s", "border": "none"});
            Utils.applyButtonInteractionEffects(cerrarBtn);
            const modalTitle = $("<h2>").addClass("modal-title").html(`<img src="https://forocoches.com/foro/images/smilies/goofy.gif" alt="goofy"> Roto2Tools <img src="https://forocoches.com/foro/images/smilies/goofy.gif" alt="goofy">`).css({ "text-align": "center", display: "block", margin: "0 auto", color: "#eee"});
            const modalHeader = $("<div>").addClass("modal-header").append(modalTitle);
            const modalBody = $("<div>").addClass("modal-body").append(tabList).append(tabContent);
            const modalFooter = $("<div>").addClass("modal-footer").append(guardarlistasBtn).append(cerrarBtn);
            const modalContent = $("<div>").addClass("modal-content").css({"box-shadow": "0px 2px 4px #000000", "overflow": "hidden"}).append(modalHeader).append(modalBody).append(modalFooter);
            const modalDialog = $("<div>").addClass("modal-dialog modal-lg").attr("role", "document").append(modalContent);
            const modalElement = $("<div>").addClass("modal fade").attr("id", "roto2ToolsModal").attr("tabindex", "-1").attr("role", "dialog").attr("aria-labelledby", "roto2ToolsModalLabel").attr("aria-hidden", "true").append(modalDialog);
            $('body').append(modalElement);
            const modalInstance = new bootstrap.Modal(modalElement[0]);
            guardarlistasBtn.on("click", function () {
                const data = { resaltarHilos: resaltarHilosComp.getValues(), ocultarHilos: ocultarHilosComp.getValues(), ocultarContactos: ocultarContactosComp.getValues(), resaltarContactos: resaltarContactosComp.getValues() };
                if (typeof onSave === 'function') { onSave(data); }
                toastr["success"](`Las listas se han guardado correctamente shur  <img src="https://forocoches.com/foro/images/smilies/thumbsup.gif" alt="thumbsup">`, `Roto2Tools`);
            });
            exportBtn.on('click', function() {
                try {
                    const dataToExport = { resaltarHilos: resaltarHilosComp.getValues(), ocultarHilos: ocultarHilosComp.getValues(), ocultarContactos: ocultarContactosComp.getValues(), resaltarContactos: resaltarContactosComp.getValues() };
                    const jsonString = JSON.stringify(dataToExport, null, 2);
                    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    const timestamp = new Date().toISOString().slice(0, 19).replace(/[-T:]/g, "");
                    link.download = `roto2tools_backup_${timestamp}.json`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    toastr.success("Listas exportadas correctamente.", "Roto2Tools Backup");
                } catch (error) {
                    console.error("Error al exportar:", error);
                    toastr.error("Hubo un error al exportar las listas.", "Roto2Tools Backup");
                }
            });
            importBtn.on('click', function() { importFileInput.click(); });
            importFileInput.on('change', function(event) {
                const file = event.target.files[0];
                if (!file) { return; }
                if (file.type !== "application/json") { toastr.error("Por favor, selecciona un archivo .json válido.", "Roto2Tools Backup"); $(this).val(null); return; }
                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        const importedData = JSON.parse(e.target.result);
                        const expectedKeys = ['resaltarHilos', 'ocultarHilos', 'ocultarContactos', 'resaltarContactos'];
                        let isValid = expectedKeys.every(key => Array.isArray(importedData[key]));
                        if (!isValid) { throw new Error("El archivo JSON no tiene la estructura esperada."); }
                        resaltarHilosComp.setValues(importedData.resaltarHilos);
                        ocultarHilosComp.setValues(importedData.ocultarHilos);
                        ocultarContactosComp.setValues(importedData.ocultarContactos);
                        resaltarContactosComp.setValues(importedData.resaltarContactos);
                        toastr.success("Listas importadas correctamente desde el archivo.", "Roto2Tools Backup");
                    } catch (error) {
                        console.error("Error al importar:", error);
                        toastr.error(`Error al importar el archivo: ${error.message}`, "Roto2Tools Backup");
                    } finally {
                        $(event.target).val(null);
                    }
                };
                reader.onerror = function() { console.error("Error al leer el archivo:", reader.error); toastr.error("No se pudo leer el archivo seleccionado.", "Roto2Tools Backup"); $(event.target).val(null); };
                reader.readAsText(file);
            });
            menuBtn.on("click", function () { modalInstance.show(); });
            tippy(guardarlistasBtn[0], { content: "Haz clic para guardar las listas actuales", animation: "scale", interactive: true, placement: "top", arrow: true });
            tippy(cerrarBtn[0], { content: "Cierra la ventana sin guardar cambios", animation: "scale", placement: "top", arrow: true });
            tippy(menuBtn[0], { content: "Haz clic para abrir las preferencias", animation: "scale", interactive: true, placement: "bottom", arrow: true });
            tippy(exportBtn[0], { content: "Guarda todas tus listas en un archivo JSON", animation: "scale", placement: "top", arrow: true });
            tippy(importBtn[0], { content: "Carga listas desde un archivo JSON (reemplaza las actuales)", animation: "scale", placement: "top", arrow: true });
            return {resaltarHilosComp, ocultarHilosComp, ocultarContactosComp, resaltarContactosComp};
        }
    };
})(window, jQuery, bootstrap, toastr, tippy, window.Roto2ToolsUtils || {});