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
    window.Roto2ToolsMenu = {
        create: function(options) {
            const {initialResaltarHilos, initialOcultarHilos, initialResaltarContactos, initialOcultarContactos, onSave, scriptVersion} = options;
            const Roto2ToolsContainer = $("#searchform-desktop");
            const guardarlistasBtn = $("<button>").text("Guardar cambios").attr("type", "button").attr("data-bs-dismiss", "modal").css({"background-color": "rgb(255, 90, 75)", color: "white", "font-weight": "bold", padding: "10px 20px", "border-radius": "6px", "text-shadow": "rgb(0, 0, 0) 1px 1px 4px", cursor: "pointer", "box-shadow": "0px 2px 4px #000000", transition: "transform 0.3s, box-shadow 0.3s"});
            Utils.applyButtonInteractionEffects(guardarlistasBtn);
            const menuBtn = $("<button>").html("Roto2Tools").css({"background-color": "#FF5A4B", color: "white", padding: "10px 20px", "font-weight": "bold", "text-shadow": "1px 1px 4px #000", "border-radius": "6px", cursor: "pointer", "margin-left": "5px", "box-shadow": "0px 2px 4px #000000", transition: "transform 0.3s, box-shadow 0.3s"});
            Utils.applyButtonInteractionEffects(menuBtn);
            if (Roto2ToolsContainer.length > 0) {Roto2ToolsContainer.after(menuBtn);}
            const resaltarHilosInput = Utils.createStyledTextarea("Agregar palabras a resaltar separadas por comas, ejemplo: palabra, palabra", initialResaltarHilos);
            const ocultarInput = Utils.createStyledTextarea("Agregar palabras a ocultar separadas por comas, ejemplo: palabra, palabra", initialOcultarHilos);
            const ocultarContactosInput = Utils.createStyledTextarea("Agregar usuarios para ocultar sus hilos separados por comas (sin el @), ejemplo: Pepe palotes, iliti", initialOcultarContactos);
            const resaltarMensajesContactosInput = Utils.createStyledTextarea("Agregar usuarios para resaltar sus mensajes en los hilos separados por comas (sin el @), ejemplo: Pepe palotes, iliti", initialResaltarContactos);
            const acercaRoto2Tools = $("<div>")
                .addClass("tab-about")
                .html(
                    `<div style="text-align: center;">
                        <p>Script para Forocoches que oculta hilos o los resalta con las palabras añadidas por el usuario</p>
                        <div style="text-align: right;">
                        <strong><a href="https://github.com/Deci8BelioS/Roto2Tools/" target="_blank">Github Roto2Tools</a></strong>
                        <br>
                        <span><strong>Versión instalada:</strong> ${scriptVersion}</span>
                        </div>
                    </div>`
                )
                .css({ color: "#fff", "margin-top": "10px" });
            const tabsConfig = [
                { id: "opcion1", title: "Resaltar hilos", color: "rgb(237, 212, 14)", content: resaltarHilosInput, active: true },
                { id: "opcion2", title: "Ocultar hilos", color: "rgb(253, 93, 77)", content: ocultarInput },
                { id: "opcion3", title: "Ocultar usuarios", color: "rgb(255, 38, 38)", content: ocultarContactosInput },
                { id: "opcion4", title: "Resaltar usuarios", color: "rgb(47, 199, 38)", content: resaltarMensajesContactosInput },
                { id: "opcion5", title: "Acerca de Roto2Tools", color: "rgb(255, 255, 255)", content: acercaRoto2Tools }
            ];
            const tabList = $("<ul>").addClass("nav nav-tabs").attr("id", "myTab").attr("role", "tablist");
            const tabContent = $("<div>").addClass("tab-content");
            tabsConfig.forEach((tab) => {
                const link = $("<a>").addClass(`nav-link ${tab.active ? 'active' : ''}`).attr("id", `${tab.id}-tab`).attr("data-bs-toggle", "tab").attr("href", `#${tab.id}`).attr("role", "tab").attr("aria-controls", tab.id).attr("aria-selected", tab.active ? "true" : "false").html(tab.title).css({color: tab.color, "font-weight": "bold", "text-align": "center"}).hover(function () { $(this).css("background-color", `rgba(${tab.color.match(/\d+/g).join(',')}, 0.1)`); }, function () { $(this).css("background-color", ""); });
                tabList.append($("<li>").addClass("nav-item").append(link));
                const pane = $("<div>").addClass(`tab-pane fade ${tab.active ? 'show active' : ''}`).attr("id", tab.id).attr("role", "tabpanel").attr("aria-labelledby", `${tab.id}-tab`).append($("<div>").addClass("tab-content").append(tab.content));
                tabContent.append(pane);
            });
            const cerrarBtn = $("<button>").attr("type", "button").attr("data-bs-dismiss", "modal").html("Cerrar").css({bottom: "20px", padding: "10px 20px", "border-radius": "6px", "text-shadow": "rgb(0, 0, 0) 1px 1px 4px", "background-color": "rgb(85, 85, 85)", color: "white", cursor: "pointer", "box-shadow": "0px 2px 4px #000000", transition: "transform 0.3s, box-shadow 0.3s"});
            Utils.applyButtonInteractionEffects(cerrarBtn);
            const modalContent = $("<div>").addClass("modal-content").css({"box-shadow": "0px 2px 4px #000000", overflow: "auto"}).append($("<div>").addClass("modal-header").append($("<h2>").addClass("modal-title").html(`<img src="https://forocoches.com/foro/images/smilies/goofy.gif"> Roto2Tools <img src="https://forocoches.com/foro/images/smilies/goofy.gif">`).css({ "text-align": "center", display: "block", margin: "0 auto" }))).append($("<div>").addClass("modal-body").append(tabList).append(tabContent)).append($("<div>").addClass("modal-footer").append(guardarlistasBtn).append(cerrarBtn));
            const modalElement = $("<div>").addClass("modal fade").attr("tabindex", "-1").attr("role", "dialog").append($("<div>").addClass("modal-dialog modal-dialog").css({ "max-width": "auto", "max-height": "auto" }).attr("role", "document").append(modalContent));
            $('body').append(modalElement);
            const modalInstance = new bootstrap.Modal(modalElement[0]);
            guardarlistasBtn.on("click", function () {
                const processInput = (inputVal) => inputVal ? inputVal.split(',').map(s => s.trim()).filter(Boolean) : [];
                const data = {ocultarHilos: processInput(ocultarInput.val()), resaltarHilos: processInput(resaltarHilosInput.val()), ocultarContactos: processInput(ocultarContactosInput.val()), resaltarContactos: processInput(resaltarMensajesContactosInput.val())};
                if (typeof onSave === 'function') {onSave(data);}
                toastr["success"](`Las listas se han guardado correctamente shur &nbsp;<img src="https://forocoches.com/foro/images/smilies/thumbsup.gif">`, `Roto2Tools`);
            });
            menuBtn.on("click", function () {modalInstance.show();});
            tippy(guardarlistasBtn[0], { content: "Haz clic para guardar las listas", animation: "scale", interactive: true, placement: "bottom", arrow: true });
            tippy(menuBtn[0], { content: "Haz clic para abrir las preferencias", animation: "scale", interactive: true, placement: "bottom", arrow: true });
            return {resaltarHilosInput, ocultarInput, ocultarContactosInput, resaltarMensajesContactosInput};
        }
    };
})(window, window.jQuery, window.bootstrap, window.toastr, window.tippy, window.Roto2ToolsUtils);