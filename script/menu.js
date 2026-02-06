// ==UserScript==
// @name         Roto2Tools Menu UI
// @namespace    Roto2Tools
// @version      1.0
// @description  UI creation for Roto2Tools Menu
// @author       DeciBelioS
// @grant        none
// ==/UserScript==

(function(window, $, bootstrap, toastr, tippy, Utils) {
    'use strict';
    if (!$) { console.error("Roto2Tools Menu: jQuery no está disponible."); return; }
    if (!bootstrap) { console.error("Roto2Tools Menu: Bootstrap no está disponible."); return; }
    if (!toastr) { console.error("Roto2Tools Menu: Toastr no está disponible."); return; }
    if (!tippy) { console.error("Roto2Tools Menu: Tippy no está disponible."); return; }
    if (!Utils) { console.error("Roto2Tools Menu: Roto2ToolsUtils no está disponible."); return; }
    function createTagInputComponent(title, placeholder, initialValues = [], importType = null) {
        const componentId = `tags-${Math.random().toString(36).substring(2, 9)}`;
        let currentTags = new Set(Array.isArray(initialValues) ? initialValues.map(t => String(t).trim()).filter(Boolean) : []);
        const container = $('<div>').addClass('tag-input-component');
        const header = $('<div>').addClass('tag-input-header');
        const countElement = $('<span>').addClass('tag-count');
        const headerTitle = $('<h2>').text(title).append(countElement);
        const btnContainer = $('<div>');
        if (importType) {
            const importBtn = $('<button>').attr('type', 'button').addClass('import-list-btn').html('<i class="fa-solid fa-cloud-arrow-down"></i> Importar FC');
            importBtn.css({ 'margin-right': '10px', 'background': '#337ab7', 'color': '#fff', 'border': 'none', 'border-radius': '6px', 'padding': '5px 10px', 'cursor': 'pointer', 'transition': 'background 0.2s' });
            importBtn.on('click', function() {
                toastr.info("Obteniendo lista desde Forocoches...", "Roto2Tools");
                Utils.fetchOnlineList(importType).then(users => {
                    if(users.length === 0) {
                        toastr.warning("La lista en Forocoches está vacía.", "Roto2Tools");
                        return;
                    }
                    const uniqueImportedUsers = [...new Set(users)];
                    let addedCount = 0;
                    let duplicatesCount = 0;
                    const existingTagsLower = new Set(Array.from(currentTags).map(t => t.toLowerCase()));
                    uniqueImportedUsers.forEach(u => {
                        const uTrimmed = u.trim();
                        if (!currentTags.has(uTrimmed) && !existingTagsLower.has(uTrimmed.toLowerCase())) {
                            currentTags.add(uTrimmed);
                            renderTag(uTrimmed);
                            existingTagsLower.add(uTrimmed.toLowerCase());
                            addedCount++;
                        } else {
                            duplicatesCount++;
                        }
                    });
                    updateCount();
                    if (addedCount > 0) {
                        toastr.success(`Se han importado ${addedCount} usuarios nuevos.`, "Roto2Tools");
                    }
                    if (duplicatesCount > 0) {
                        const msg = addedCount === 0 ? "Todos los usuarios ya estaban en tu lista." : `Se omitieron ${duplicatesCount} usuarios que ya tenías añadidos.`;
                        toastr.info(msg, "Roto2Tools");
                    }
                }).catch(err => {
                    console.error(err);
                    toastr.error("Error al importar la lista. Asegúrate de estar logueado.", "Roto2Tools");
                });
            });
            btnContainer.append(importBtn);
        }
        const clearButton = $('<button>').attr('type', 'button').addClass('clear-list-btn').html('<i class="fa-solid fa-trash"></i> Limpiar lista');
        btnContainer.append(clearButton);
        header.append(headerTitle).append(btnContainer);
        const tagsDisplay = $('<div>').addClass('tags-display');
        const controls = $('<div>').addClass('tag-input-controls');
        const input = $('<input>').attr('type', 'text').attr('placeholder', placeholder);
        const addButton = $('<button>').attr('type', 'button').addClass('add-tag-btn').html('<i class="fa-solid fa-plus"></i> Añadir');
        function updateCount() {
            countElement.text(`(${currentTags.size})`);
        }
        function renderTag(text) {
            const tag = $('<span>').addClass('tag').data('value', text);
            const tagText = $('<span>').text(text);
            const deleteBtn = $('<span>').addClass('delete-tag').html('×');
            deleteBtn.on('click', function() {
                const valueToRemove = $(this).closest('.tag').data('value');
                currentTags.delete(valueToRemove);
                $(this).closest('.tag').remove();
                updateCount();
            });
            tag.append(tagText).append(deleteBtn);
            tagsDisplay.append(tag);
            tagsDisplay.scrollTop(tagsDisplay[0].scrollHeight);
        }
        function addTagFromInput() {
            const value = input.val().trim();
            const valueLower = value.toLowerCase();
            const existingLower = Array.from(currentTags).map(t => t.toLowerCase());
            if (value && !existingLower.includes(valueLower)) {
                currentTags.add(value);
                renderTag(value);
                input.val('');
                updateCount();
            } else if (existingLower.includes(valueLower)) {
                toastr.warning(`"${value}" ya está en la lista.`, `Roto2Tools`);
            }
            input.focus();
        }
        function clearAllTags() {
            if (confirm('¿Estás seguro de que quieres borrar toda la lista?')) {
                currentTags.clear();
                tagsDisplay.empty();
                updateCount();
                toastr.info(`La lista "${title}" ha sido limpiada.`, `Roto2Tools`);
            }
        }
        addButton.on('click', addTagFromInput);
        input.on('keypress', function(e) { if (e.key === 'Enter') { e.preventDefault(); addTagFromInput(); }});
        clearButton.on('click', clearAllTags);
        function setValues(newValues) {
            if (!Array.isArray(newValues)) { console.error("setValues espera un array:", newValues); return; }
            currentTags.clear();
            tagsDisplay.empty();
            newValues.forEach(value => {
                const trimmedValue = String(value).trim();
                if (trimmedValue && !currentTags.has(trimmedValue)) {
                    currentTags.add(trimmedValue);
                    renderTag(trimmedValue);
                }
            });
            updateCount();
        }
        currentTags.forEach(tagText => renderTag(tagText));
        controls.append(input).append(addButton);
        container.append(header).append(tagsDisplay).append(controls);
        updateCount();
        return {
            element: container,
            getValues: () => Array.from(currentTags),
            setValues: setValues
        };
    }
    window.Roto2ToolsMenu = {
        create: function(options) {
            const {initialResaltarHilos, initialOcultarHilos, initialResaltarContactos, initialOcultarContactos, onSave, scriptVersion} = options;
            const isNavCollapsed = GM_getValue('roto2tools_nav_collapsed', false);
            const Roto2ToolsContainer = $("#searchform-desktop");
            const menuBtn = $("<button>").html("Roto2Tools").addClass('rt2-main-button');
            Utils.applyButtonInteractionEffects(menuBtn);
            if (Roto2ToolsContainer.length > 0) { Roto2ToolsContainer.after(menuBtn); } else { $('body').prepend(menuBtn.css({'position': 'fixed', 'top': '10px', 'right': '10px', 'z-index': '9999'})); }
            const resaltarHilosComp = createTagInputComponent("Resaltar Hilos", "Añadir palabra a resaltar...", initialResaltarHilos);
            const ocultarHilosComp = createTagInputComponent("Ocultar Hilos", "Añadir palabra a ocultar...", initialOcultarHilos);
            const ocultarContactosComp = createTagInputComponent("Ocultar Usuarios", "Añadir usuario a ocultar (sin @)...", initialOcultarContactos, 'ignore');
            const resaltarContactosComp = createTagInputComponent("Resaltar Usuarios", "Añadir usuario a resaltar (sin @)...", initialResaltarContactos, 'buddy');
            const sectionsConfig = [
                { id: "resaltar-hilos", title: "Resaltar Hilos", icon: "fa-solid fa-star", content: resaltarHilosComp.element, color: "#EDD40E", active: true },
                { id: "ocultar-hilos", title: "Ocultar Hilos", icon: "fa-solid fa-eye-slash", content: ocultarHilosComp.element, color: "#FD5D4D" },
                { id: "resaltar-users", title: "Resaltar Usuarios", icon: "fa-solid fa-user-check", content: resaltarContactosComp.element, color: "#2FC726" },
                { id: "ocultar-users", title: "Ocultar Usuarios", icon: "fa-solid fa-user-slash", content: ocultarContactosComp.element, color: "#FF2626" },
                { id: "backup", title: "Copia de Seguridad", icon: "fa-solid fa-floppy-disk", content: createBackupSection().element, color: "#589cfc" },
                { id: "about", title: "Acerca de", icon: "fa-solid fa-info-circle", content: createAboutSection(scriptVersion).element, color: "#C8C8C8" }
            ];
            const navContainer = $("<div>").addClass("roto2tools-nav");
            const contentContainer = $("<div>").addClass("roto2tools-content");
            sectionsConfig.forEach(section => {
                const navLink = $("<a>").attr("href", "#").addClass("roto2tools-nav-link").data("target", `#${section.id}`)
                                    .html(`<i class="${section.icon}" style="color: ${section.color};"></i> <span>${section.title}</span>`);
                const contentPane = $("<div>").addClass("roto2tools-content-pane").attr("id", section.id).append(section.content);
                if (section.active) {
                    navLink.addClass("active");
                    contentPane.addClass("active");
                }
                navContainer.append(navLink);
                contentContainer.append(contentPane);
            });
            navContainer.on("click", ".roto2tools-nav-link:not(#nav-toggle-btn)", function(e) {
                e.preventDefault();
                const targetId = $(this).data("target");
                navContainer.find(".roto2tools-nav-link").removeClass("active");
                $(this).addClass("active");
                contentContainer.find(".roto2tools-content-pane").removeClass("active");
                $(targetId).addClass("active");
            });
            const navToggleBtn = $('<button>').attr('id', 'nav-toggle-btn').addClass('roto2tools-nav-link');
            const navToggleIcon = $('<i>').addClass('fa-solid');
            navToggleBtn.append(navToggleIcon).append('<span>Ocultar Menú</span>');
            navContainer.append(navToggleBtn);
            const mainLayout = $('<div>').addClass('roto2tools-main-layout').append(navContainer).append(contentContainer);
            const modalTitle = $("<h2>").addClass("modal-title").html(`<img src="https://forocoches.com/foro/images/smilies/goofy.gif" alt="goofy"> Roto2Tools Panel`);
            const modalHeader = $("<div>").addClass("modal-header").append(modalTitle);
            const modalBody = $("<div>").addClass("modal-body").append(mainLayout);
            const guardarlistasBtn = $("<button>").addClass("rt2-button rt2-button-save").attr("type", "button").attr("data-bs-dismiss", "modal").html('<i class="fa-solid fa-save"></i> Guardar y Recargar');
            const cerrarBtn = $("<button>").addClass("rt2-button rt2-button-close").attr("type", "button").attr("data-bs-dismiss", "modal").html("Cerrar");
            const modalFooter = $("<div>").addClass("modal-footer").append(cerrarBtn).append(guardarlistasBtn);
            const modalContent = $("<div>").addClass("modal-content modal-glassmorphism roto2tools-modal-content").append(modalHeader).append(modalBody).append(modalFooter);
            const modalDialog = $("<div>").addClass("modal-dialog modal-xl").append(modalContent);
            const modalElement = $("<div>").addClass("modal fade").attr("id", "roto2ToolsModal").attr("tabindex", "-1").append(modalDialog);
            $('body').append(modalElement);
            const modalInstance = new bootstrap.Modal(modalElement[0]);
            function setNavCollapsedState(collapsed) {
                modalContent.toggleClass('nav-collapsed', collapsed);
                navToggleIcon.toggleClass('fa-chevrons-right', collapsed).toggleClass('fa-chevrons-left', !collapsed);
                updateNavTooltips(collapsed);
            }
            setNavCollapsedState(isNavCollapsed);
            navToggleBtn.on('click', function(e) {
                e.preventDefault();
                const newState = !modalContent.hasClass('nav-collapsed');
                GM_setValue('roto2tools_nav_collapsed', newState);
                setNavCollapsedState(newState);
            });
            function updateNavTooltips(isCollapsed) {
                navContainer.find('.roto2tools-nav-link').not('#nav-toggle-btn').each(function() {
                    const link = $(this);
                    const title = link.find('span').text();
                    let tippyInstance = link[0]._tippy;
                    if (isCollapsed) {
                        if (!tippyInstance) {
                            tippy(link[0], { content: title, placement: 'right', animation: 'scale-subtle' });
                        } else {
                            tippyInstance.enable();
                        }
                    } else {
                        if (tippyInstance) {
                            tippyInstance.disable();
                        }
                    }
                });
            }
            guardarlistasBtn.on("click", function () {
                const data = {
                    resaltarHilos: resaltarHilosComp.getValues(),
                    ocultarHilos: ocultarHilosComp.getValues(),
                    ocultarContactos: ocultarContactosComp.getValues(),
                    resaltarContactos: resaltarContactosComp.getValues()
                };
                if (typeof onSave === 'function') { onSave(data); }
                toastr["success"](`Listas guardadas. Se recomienda recargar la página.`, `Roto2Tools`);
            });
            menuBtn.on("click", () => modalInstance.show());
            function createAboutSection(version) {
                const element = $(`
                    <div class="static-content-section">
                        <h2><i class="fa-solid fa-info-circle"></i> Acerca de Roto2Tools</h2>
                        <p>Este script mejora tu experiencia en Forocoches permitiéndote resaltar u ocultar hilos y usuarios según tus preferencias personales.</p>
                        <div class="about-links">
                            <a href="https://github.com/Deci8BelioS/Roto2Tools/" target="_blank" class="rt2-button"><i class="fa-brands fa-github"></i> Ver en GitHub</a>
                        </div>
                        <div class="about-version">
                            Versión instalada: <strong>${version}</strong>
                        </div>
                    </div>
                `);
                return { element };
            }
            function createBackupSection() {
                const exportBtn = $('<button>').addClass('rt2-button rt2-button-export').html('<i class="fa-solid fa-file-export"></i> Exportar Listas');
                const importBtn = $('<button>').addClass('rt2-button rt2-button-import').html('<i class="fa-solid fa-file-import"></i> Importar Listas');
                const importFileInput = $('<input>').attr('type', 'file').attr('id', 'import-file-input').attr('accept', '.json').hide();
                const element = $('<div>').addClass('static-content-section backup-section')
                    .append('<h2><i class="fa-solid fa-floppy-disk"></i> Copia de Seguridad</h2>')
                    .append('<p>Guarda tus listas en un archivo o cárgalas desde una copia de seguridad. La importación reemplazará tus listas actuales.</p>')
                    .append($('<div>').addClass('backup-buttons').append(exportBtn).append(importBtn).append(importFileInput));
                importBtn.on('click', () => importFileInput.click());
                exportBtn.on('click', handleExport);
                importFileInput.on('change', handleImport);
                return { element };
            }
            function handleExport() {
                try {
                    const dataToExport = { resaltarHilos: resaltarHilosComp.getValues(), ocultarHilos: ocultarHilosComp.getValues(), ocultarContactos: ocultarContactosComp.getValues(), resaltarContactos: resaltarContactosComp.getValues() };
                    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `roto2tools_backup_${new Date().toISOString().slice(0, 10)}.json`;
                    link.click();
                    URL.revokeObjectURL(url);
                    toastr.success("Listas exportadas correctamente.", "Roto2Tools");
                } catch (error) {
                    toastr.error("Hubo un error al exportar las listas.", "Roto2Tools");
                }
            }
            function handleImport(event) {
                const file = event.target.files[0];
                if (!file || file.type !== "application/json") {
                    toastr.error("Por favor, selecciona un archivo .json válido.", "Roto2Tools");
                    return;
                }
                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        const data = JSON.parse(e.target.result);
                        resaltarHilosComp.setValues(data.resaltarHilos || []);
                        ocultarHilosComp.setValues(data.ocultarHilos || []);
                        resaltarContactosComp.setValues(data.resaltarContactos || []);
                        ocultarContactosComp.setValues(data.ocultarContactos || []);
                        toastr.success("Listas importadas. Guarda los cambios para aplicarlas.", "Roto2Tools");
                    } catch (error) {
                        toastr.error(`Error al importar el archivo: ${error.message}`, "Roto2Tools");
                    }
                };
                reader.readAsText(file);
                $(event.target).val(null);
            }
            return {resaltarHilosComp, ocultarHilosComp, ocultarContactosComp, resaltarContactosComp};
        }
    };
})(window, jQuery, bootstrap, toastr, tippy, window.Roto2ToolsUtils || {});