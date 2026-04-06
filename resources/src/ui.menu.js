// ============================================================
// ui.menu.js — Roto2Tools
// ============================================================
// ── Botón de favorito dentro del hilo ───────────────────────
function injectFavoriteButtonInThread() {
    if (!settings.botonFavoritoHilo) return;
    const threadData = Roto2ToolsUtils.getRealThreadData();
    if (!threadData) return;
    const { id, type } = threadData;
    const h1 = document.querySelector('#container > section h1') || document.querySelector('.without-bottom-corners h1') || document.querySelector('h1');
    if (!h1) return;
    const title = h1.innerText.trim();
    const isFavNow = GM_getValue('rt2_favorites', []).some(f => f.id === id);
    const star = document.createElement('button');
    star.id = 'rt2-fav-thread-btn';
    star.title = isFavNow ? 'Quitar de favoritos' : 'Añadir a favoritos';
    star.textContent = isFavNow ? '★' : '☆';
    if (isFavNow) star.classList.add('is-fav');
    star.addEventListener('click', () => {
        let f = GM_getValue('rt2_favorites', []);
        if (f.some(x => x.id === id)) {
            f = f.filter(x => x.id !== id);
            star.textContent = '☆';
            star.classList.remove('is-fav');
            star.title = 'Añadir a favoritos';
            Roto2ToolsUtils.showToast('info', 'Eliminado de favoritos.', 'Roto2Tools');
        } else {
            f.unshift({ id, title, type });
            star.textContent = '★';
            star.classList.add('is-fav');
            star.title = 'Quitar de favoritos';
            Roto2ToolsUtils.showToast('success', 'Añadido a favoritos.', 'Roto2Tools');
        }
        GM_setValue('rt2_favorites', f);
    });
    if (h1.parentElement?.style.display === 'flex') {
        h1.parentElement.appendChild(star);
    } else {
        h1.parentNode.insertBefore(star, h1.nextSibling);
    }
}
// ── Tag Input Component ──────────────────────────────────────
function createTagInputComponent(title, placeholder, initialValues = [], importType = null) {
    const currentTags = new Set(
        Array.isArray(initialValues) ? initialValues.map(t => String(t).trim()).filter(Boolean) : []
    );
    const wrapper = document.createElement('div');
    wrapper.className = 'tag-input-component';
    const header = document.createElement('div');
    header.className = 'tag-input-header';
    const headerTitle = document.createElement('h2');
    headerTitle.innerText = title;
    const countEl = document.createElement('span');
    countEl.className = 'tag-count';
    headerTitle.appendChild(countEl);
    const btnContainer = document.createElement('div');
    if (importType) {
        const importBtn = document.createElement('button');
        importBtn.type = 'button';
        importBtn.className = 'import-list-btn';
        importBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> Importar FC';
        Roto2ToolsUtils.applyTooltip(importBtn, `Importar lista de ${importType === 'buddy' ? 'amigos' : 'ignorados'} desde Forocoches`);
        importBtn.addEventListener('click', async () => {
            Roto2ToolsUtils.showToast('info', 'Obteniendo lista desde Forocoches...', 'Roto2Tools');
            try {
                const users = await Roto2ToolsUtils.fetchOnlineList(importType);
                let added = 0;
                users.forEach(u => {
                    if (!currentTags.has(u)) { currentTags.add(u); renderTag(u); added++; }
                });
                updateCount();
                Roto2ToolsUtils.showToast(
                    added > 0 ? 'success' : 'info',
                    added > 0 ? `Importados ${added} usuario(s).` : 'No hay usuarios nuevos.',
                    'Roto2Tools'
                );
            } catch {
                Roto2ToolsUtils.showToast('error', 'Error al importar la lista.', 'Roto2Tools');
            }
        });
        btnContainer.appendChild(importBtn);
    }
    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'clear-list-btn';
    clearBtn.innerHTML = '<i class="fa-solid fa-trash"></i> Limpiar lista';
    clearBtn.addEventListener('click', () => {
        if (confirm('¿Borrar toda la lista?')) {
            currentTags.clear();
            tagsDisplay.innerHTML = '';
            updateCount();
        }
    });
    btnContainer.appendChild(clearBtn);
    header.append(headerTitle, btnContainer);
    const tagsDisplay = document.createElement('div');
    tagsDisplay.className = 'tags-display';
    const controls = document.createElement('div');
    controls.className = 'tag-input-controls';
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = placeholder;
    const addButton = document.createElement('button');
    addButton.type = 'button';
    addButton.className = 'add-tag-btn';
    addButton.innerHTML = '<i class="fa-solid fa-plus"></i> Añadir';
    function updateCount() { countEl.innerText = ` (${currentTags.size})`; }
    function renderTag(text) {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.dataset.value = text;
        const tagText = document.createElement('span');
        tagText.innerText = text;
        const deleteBtn = document.createElement('span');
        deleteBtn.className = 'delete-tag';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.addEventListener('click', () => {
            currentTags.delete(text);
            tag.remove();
            updateCount();
        });
        tag.append(tagText, deleteBtn);
        tagsDisplay.appendChild(tag);
        tagsDisplay.scrollTop = tagsDisplay.scrollHeight;
    }
    function addFromInput() {
        const val = input.value.trim();
        const exists = [...currentTags].some(t => t.toLowerCase() === val.toLowerCase());
        if (val && !exists) {
            currentTags.add(val);
            renderTag(val);
            input.value = '';
            updateCount();
        }
        input.focus();
    }
    addButton.addEventListener('click', addFromInput);
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); addFromInput(); }
    });
    currentTags.forEach(t => renderTag(t));
    updateCount();
    controls.append(input, addButton);
    wrapper.append(header, tagsDisplay, controls);
    return {
        element: wrapper,
        getValues: () => [...currentTags],
        setValues(vals) {
            currentTags.clear();
            tagsDisplay.innerHTML = '';
            vals.forEach(v => { currentTags.add(v); renderTag(v); });
            updateCount();
        },
    };
}
// ── Sección de Ajustes ───────────────────────────────────────
function createSettingsSection() {
    const el = document.createElement('div');
    el.className = 'static-content-section rt2-settings-section';
    function makeGroup(label) {
        const grp = document.createElement('div');
        grp.className = 'rt2-settings-group';
        const title = document.createElement('h3');
        title.className = 'rt2-settings-group-title';
        title.textContent = label;
        grp.appendChild(title);
        return grp;
    }
    function makeToggleRow(label, desc, key) {
        const row = document.createElement('div');
        row.className = 'rt2-settings-row';
        const info = document.createElement('div');
        info.className = 'rt2-settings-row-info';
        const lbl = document.createElement('span');
        lbl.className = 'rt2-settings-row-label';
        lbl.textContent = label;
        info.appendChild(lbl);
        if (desc) {
            const d = document.createElement('span');
            d.className = 'rt2-settings-row-desc';
            d.textContent = desc;
            info.appendChild(d);
        }
        const toggle = document.createElement('label');
        toggle.className = 'rt2-toggle';
        const chk = document.createElement('input');
        chk.type = 'checkbox';
        chk.checked = !!settings[key];
        chk.addEventListener('change', () => { settings[key] = chk.checked; });
        const slider = document.createElement('span');
        slider.className = 'rt2-toggle-slider';
        toggle.append(chk, slider);
        row.append(info, toggle);
        return row;
    }
    function makeColorRow(label, colorKey) {
        const row = document.createElement('div');
        row.className = 'rt2-settings-row';
        const lbl = document.createElement('span');
        lbl.className = 'rt2-settings-row-label';
        lbl.textContent = label;
        const colorWrap = document.createElement('div');
        colorWrap.className = 'rt2-color-wrap';
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = settings.colores[colorKey];
        colorInput.className = 'rt2-color-input';
        const hexLabel = document.createElement('code');
        hexLabel.className = 'rt2-color-hex';
        hexLabel.textContent = colorInput.value;
        colorInput.addEventListener('input', () => {
            settings.colores[colorKey] = colorInput.value;
            hexLabel.textContent = colorInput.value;
        });
        colorWrap.append(colorInput, hexLabel);
        row.append(lbl, colorWrap);
        return row;
    }
    function makeNumberRow(label, desc, key, min, max) {
        const row = document.createElement('div');
        row.className = 'rt2-settings-row';
        const info = document.createElement('div');
        info.className = 'rt2-settings-row-info';
        const lbl = document.createElement('span');
        lbl.className = 'rt2-settings-row-label';
        lbl.textContent = label;
        info.appendChild(lbl);
        if (desc) {
            const d = document.createElement('span');
            d.className = 'rt2-settings-row-desc';
            d.textContent = desc;
            info.appendChild(d);
        }
        const numInput = document.createElement('input');
        numInput.type = 'number';
        numInput.min = min;
        numInput.max = max;
        numInput.value = settings[key];
        numInput.className = 'rt2-number-input';
        numInput.addEventListener('change', () => {
            const v = Math.max(min, Math.min(max, parseInt(numInput.value) || min));
            numInput.value = v;
            settings[key] = v;
        });
        row.append(info, numInput);
        return row;
    }
    const grpFunc = makeGroup('⚙️ Funcionalidades');
    grpFunc.appendChild(makeToggleRow(
        'CSS cust0mMensajes',
        'Aplica estilos visuales personalizados a los mensajes del foro.',
        'cust0mMensajes'
    ));
    grpFunc.appendChild(makeToggleRow(
        'Expandir layout',
        'Expande el ancho del header y del contenido principal al 100%.',
        'expandirLayout'
    ));
    grpFunc.appendChild(makeToggleRow(
        'Botón favorito en hilo',
        'Muestra un botón ★ en el título del hilo para guardarlo como favorito.',
        'botonFavoritoHilo'
    ));
    grpFunc.appendChild(makeToggleRow(
        'Registrar historial',
        'Guarda automáticamente los hilos que visitas en el historial.',
        'registrarHistorial'
    ));
    grpFunc.appendChild(makeToggleRow(
        'Ocultar sidebar de ID',
        'Oculta la columna lateral derecha con el ID en las páginas del foro.',
        'ocultarIdSidebar'
    ));
    el.appendChild(grpFunc);
    const grpHist = makeGroup('🕐 Historial');
    grpHist.appendChild(makeNumberRow(
        'Límite de entradas',
        'Número máximo de hilos guardados en el historial (10–500).',
        'limiteHistorial', 10, 500
    ));
    el.appendChild(grpHist);
    const grpColors = makeGroup('🎨 Colores de resaltado');
    grpColors.appendChild(makeColorRow('Ocultar contacto', 'hideContact'));
    grpColors.appendChild(makeColorRow('Resaltar contacto', 'highlightContact'));
    grpColors.appendChild(makeColorRow('Resaltar hilo', 'highlightThread'));
    grpColors.appendChild(makeColorRow('Ocultar hilo', 'hideThread'));
    el.appendChild(grpColors);
    const resetLink = document.createElement('button');
    resetLink.className = 'rt2-settings-reset-link';
    resetLink.innerHTML = '<i class="fa-solid fa-rotate-left"></i> Restablecer ajustes por defecto';
    resetLink.addEventListener('click', () => {
        if (!confirm('¿Restablecer todos los ajustes a sus valores por defecto?')) return;
        GM_setValue('rt2_settings', {});
        Roto2ToolsUtils.showToast('info', 'Ajustes restablecidos. Recargando...', 'Roto2Tools');
        setTimeout(() => location.reload(), 1000);
    });
    el.appendChild(resetLink);
    return { element: el };
}
// ── Sección Acerca de ────────────────────────────────────────
function createAboutSection(scriptVersion, compRefs) {
    const { resaltarHilosComp, ocultarHilosComp, resaltarContactosComp, ocultarContactosComp } = compRefs;
    const el = document.createElement('div');
    el.className = 'static-content-section';
    const makeInfoLine = (icon, html) => {
        const p = document.createElement('p');
        p.className = 'about-version';
        p.innerHTML = `<i class="${icon}"></i> ${html}`;
        return p;
    };
    el.appendChild(makeInfoLine('fa-solid fa-code-branch', `Versión: <strong>${scriptVersion || '—'}</strong>`));
    el.appendChild(makeInfoLine('fa-solid fa-user', 'Autor: <strong>DeciBelioS</strong>'));
    const ghLink = document.createElement('a');
    ghLink.href = 'https://github.com/Deci8BelioS/Roto2Tools/';
    ghLink.target = '_blank';
    ghLink.rel = 'noopener noreferrer';
    ghLink.className = 'rt2-button rt2-button-export rt2-about-gh-btn';
    ghLink.innerHTML = '<i class="fa-brands fa-github"></i> Ver en GitHub';
    el.appendChild(ghLink);
    const sep = document.createElement('hr');
    sep.className = 'rt2-about-sep';
    el.appendChild(sep);
    const backupTitle = document.createElement('h3');
    backupTitle.className = 'rt2-about-backup-title';
    backupTitle.innerHTML = '<i class="fa-solid fa-database"></i> Backup de listas';
    el.appendChild(backupTitle);
    const desc = document.createElement('p');
    desc.textContent = 'Exporta todas tus listas, favoritos y ajustes a un archivo JSON, o importa una copia de seguridad anterior.';
    el.appendChild(desc);
    const backupBtns = document.createElement('div');
    backupBtns.className = 'backup-buttons';
    const exportBtn = document.createElement('button');
    exportBtn.className = 'rt2-button rt2-button-export';
    exportBtn.innerHTML = '<i class="fa-solid fa-file-export"></i> Exportar backup';
    exportBtn.addEventListener('click', () => {
        const data = {
            resaltarHilos: resaltarHilosComp.getValues(),
            ocultarHilos: ocultarHilosComp.getValues(),
            resaltarContactos: resaltarContactosComp.getValues(),
            ocultarContactos: ocultarContactosComp.getValues(),
            favoritos: GM_getValue('rt2_favorites', []),
            notas: GM_getValue('rt2_notes', []),
            ajustes: GM_getValue('rt2_settings', {}),
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `roto2tools-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 150);
        Roto2ToolsUtils.showToast('success', 'Backup exportado correctamente.', 'Roto2Tools');
    });
    const importLabel = document.createElement('label');
    importLabel.className = 'rt2-button rt2-button-import';
    importLabel.innerHTML = '<i class="fa-solid fa-file-import"></i> Importar backup';
    importLabel.style.cursor = 'pointer';
    const importInput = document.createElement('input');
    importInput.type = 'file';
    importInput.accept = '.json';
    importInput.style.display = 'none';
    importInput.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            try {
                const parsed = JSON.parse(ev.target.result);
                const compMap = {
                    resaltarHilos: resaltarHilosComp,
                    ocultarHilos: ocultarHilosComp,
                    resaltarContactos: resaltarContactosComp,
                    ocultarContactos: ocultarContactosComp,
                };
                let ok = false;
                for (const [key, comp] of Object.entries(compMap)) {
                    if (Array.isArray(parsed[key])) { comp.setValues(parsed[key]); ok = true; }
                }
                if (Array.isArray(parsed.favoritos)) {
                    GM_setValue('rt2_favorites', parsed.favoritos);
                    ok = true;
                }
                if (Array.isArray(parsed.notas)) {
                    GM_setValue('rt2_notes', parsed.notas);
                    ok = true;
                }
                if (parsed.ajustes && typeof parsed.ajustes === 'object') {
                    GM_setValue('rt2_settings', parsed.ajustes);
                    ok = true;
                }
                Roto2ToolsUtils.showToast(
                    ok ? 'success' : 'error',
                    ok ? 'Backup importado. Guarda para aplicar los cambios.' : 'Archivo JSON no válido.',
                    'Roto2Tools'
                );
            } catch {
                Roto2ToolsUtils.showToast('error', 'Error al leer el archivo.', 'Roto2Tools');
            }
            importInput.value = '';
        };
        reader.readAsText(file);
    });
    importLabel.appendChild(importInput);
    backupBtns.append(exportBtn, importLabel);
    el.appendChild(backupBtns);
    return { element: el };
}
// ── Modal principal ──────────────────────────────────────────
const Roto2ToolsMenu = {
    create(options) {
        const { initialResaltarHilos, initialOcultarHilos, initialResaltarContactos, initialOcultarContactos, onSave, scriptVersion } = options;
        const menuBtn = document.createElement('button');
        menuBtn.id = 'rt2-menu-btn';
        menuBtn.className = 'rt2-main-button';
        menuBtn.innerHTML = '<i class="fa-solid fa-sliders"></i> Roto2Tools';
        Roto2ToolsUtils.applyButtonInteractionEffects(menuBtn);
        const histBtn = document.createElement('button');
        histBtn.id = 'rt2-hist-btn';
        histBtn.className = 'rt2-main-button';
        histBtn.innerHTML = '<i class="fa-solid fa-clock-rotate-left"></i>';
        histBtn.title = 'Historial y Favoritos';
        Roto2ToolsUtils.applyButtonInteractionEffects(histBtn);
        const notesBtn = document.createElement('button');
        notesBtn.id = 'rt2-notes-btn';
        notesBtn.className = 'rt2-main-button';
        notesBtn.innerHTML = '<i class="fa-solid fa-note-sticky"></i>';
        notesBtn.title = 'Notas y Copypastas';
        Roto2ToolsUtils.applyButtonInteractionEffects(notesBtn);
        const btnWrapper = document.createElement('span');
        btnWrapper.id = 'rt2-btn-wrapper';
        btnWrapper.append(menuBtn, histBtn, notesBtn);
        const container = document.querySelector('#searchform-desktop');
        if (container?.parentNode) {
            container.parentNode.insertBefore(btnWrapper, container.nextSibling);
        }
        else {
            btnWrapper.classList.add('rt2-btn-wrapper-fixed');
            document.body.appendChild(btnWrapper);
        }
        createHistoryDropdown(histBtn);
        createNotesDropdown(notesBtn);
        const resaltarHilosComp = createTagInputComponent('Resaltar Hilos', 'Añadir palabra...', initialResaltarHilos);
        const ocultarHilosComp = createTagInputComponent('Ocultar Hilos', 'Añadir palabra...', initialOcultarHilos);
        const ocultarContactosComp = createTagInputComponent('Ocultar Usuarios', 'Añadir usuario...', initialOcultarContactos, 'ignore');
        const resaltarContactosComp = createTagInputComponent('Resaltar Usuarios', 'Añadir usuario...', initialResaltarContactos, 'buddy');
        const settingsSection = createSettingsSection();
        const aboutSection = createAboutSection(scriptVersion, { resaltarHilosComp, ocultarHilosComp, resaltarContactosComp, ocultarContactosComp });
        const sectionsConfig = [
            { id: 'resaltar-hilos', title: 'Resaltar Hilos', icon: 'fa-solid fa-star', content: resaltarHilosComp.element, color: COLORS.highlightThread, active: true },
            { id: 'ocultar-hilos', title: 'Ocultar Hilos', icon: 'fa-solid fa-eye-slash', content: ocultarHilosComp.element, color: COLORS.hideThread },
            { id: 'resaltar-users', title: 'Resaltar Usuarios', icon: 'fa-solid fa-user-check', content: resaltarContactosComp.element, color: COLORS.highlightContact },
            { id: 'ocultar-users', title: 'Ocultar Usuarios', icon: 'fa-solid fa-user-slash', content: ocultarContactosComp.element, color: COLORS.hideContact },
            { id: 'ajustes', title: 'Ajustes', icon: 'fa-solid fa-gear', content: settingsSection.element, color: '#a0a8ff' },
            { id: 'acerca-de', title: 'Acerca de', icon: 'fa-solid fa-circle-info', content: aboutSection.element, color: COLORS.info },
        ];
        const makeEl = (tag, cls) => {
            const e = document.createElement(tag);
            if (cls) e.className = cls;
            return e;
        };
        const modalEl = makeEl('div', 'modal fade');
        modalEl.id = 'roto2ToolsModal';
        modalEl.setAttribute('tabindex', '-1');
        modalEl.setAttribute('role', 'dialog');
        modalEl.setAttribute('aria-modal', 'true');
        const modalDialog = makeEl('div', 'modal-dialog modal-xl');
        const modalContent = makeEl('div', 'modal-content modal-glassmorphism roto2tools-modal-content');
        const modalHeader = makeEl('div', 'modal-header');
        const versionText = scriptVersion ? ` <small class="rt2-version-text">v${scriptVersion}</small>` : '';
        modalHeader.innerHTML = `<h2 class="modal-title"><img src="https://forocoches.com/foro/images/smilies/goofy.gif" alt="goofy"> Roto2Tools Panel${versionText}</h2>`;
        const modalCloseX = document.createElement('button');
        modalCloseX.className = 'rt2-modal-close-x';
        modalCloseX.setAttribute('aria-label', 'Cerrar');
        modalCloseX.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        modalHeader.appendChild(modalCloseX);
        const modalBody = makeEl('div', 'modal-body');
        const mainLayout = makeEl('div', 'roto2tools-main-layout');
        const navContainer = makeEl('div', 'roto2tools-nav');
        const contentContainer = makeEl('div', 'roto2tools-content');
        sectionsConfig.forEach(sec => {
            const navLink = document.createElement('a');
            navLink.href = '#';
            navLink.className = 'roto2tools-nav-link';
            navLink.dataset.target = sec.id;
            navLink.setAttribute('role', 'tab');
            navLink.innerHTML = `<i class="${sec.icon}" style="color:${sec.color};"></i> <span>${sec.title}</span>`;
            const pane = makeEl('div', 'roto2tools-content-pane');
            pane.id = sec.id;
            pane.setAttribute('role', 'tabpanel');
            pane.appendChild(sec.content);
            if (sec.active) {
                navLink.classList.add('active');
                pane.classList.add('active');
            }
            navLink.addEventListener('click', e => {
                e.preventDefault();
                navContainer.querySelectorAll('.roto2tools-nav-link').forEach(l => l.classList.remove('active'));
                contentContainer.querySelectorAll('.roto2tools-content-pane').forEach(c => c.classList.remove('active'));
                navLink.classList.add('active');
                pane.classList.add('active');
            });
            navContainer.appendChild(navLink);
            contentContainer.appendChild(pane);
        });
        mainLayout.append(navContainer, contentContainer);
        modalBody.appendChild(mainLayout);
        const modalFooter = makeEl('div', 'modal-footer');
        const cerrarBtn = makeEl('button', 'rt2-button rt2-button-close');
        cerrarBtn.innerHTML = '<i class="fa-solid fa-xmark"></i> Cerrar';
        const guardarBtn = makeEl('button', 'rt2-button rt2-button-save');
        guardarBtn.innerHTML = '<i class="fa-solid fa-save"></i> Guardar';
        const closeModal = () => {
            modalEl.classList.remove('show');
            modalEl.setAttribute('aria-hidden', 'true');
            setTimeout(() => {
                modalEl.style.display = 'none';
            }, 300);
        };
        cerrarBtn.addEventListener('click', closeModal);
        modalCloseX.addEventListener('click', closeModal);
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && modalEl.style.display !== 'none') closeModal();
        });
        modalEl.addEventListener('click', e => {
            if (e.target === modalEl) closeModal();
        });
        guardarBtn.addEventListener('click', () => {
            onSave({
                resaltarHilos: resaltarHilosComp.getValues(),
                ocultarHilos: ocultarHilosComp.getValues(),
                ocultarContactos: ocultarContactosComp.getValues(),
                resaltarContactos: resaltarContactosComp.getValues(),
            });
            GM_setValue('rt2_settings', {
                cust0mMensajes: settings.cust0mMensajes,
                expandirLayout: settings.expandirLayout,
                botonFavoritoHilo: settings.botonFavoritoHilo,
                registrarHistorial: settings.registrarHistorial,
                ocultarIdSidebar: settings.ocultarIdSidebar,
                limiteHistorial: settings.limiteHistorial,
                colores: { ...settings.colores },
            });
            Roto2ToolsUtils.showToast('success', 'Guardado. Recargando...', 'Roto2Tools');
            closeModal();
            setTimeout(() => location.reload(), 1000);
        });
        modalFooter.append(guardarBtn);
        modalContent.append(modalHeader, modalBody, modalFooter);
        modalDialog.appendChild(modalContent);
        modalEl.appendChild(modalDialog);
        document.body.appendChild(modalEl);
        menuBtn.addEventListener('click', () => {
            syncRT2Theme();
            modalEl.style.display = 'block';
            modalEl.setAttribute('aria-hidden', 'false');
            requestAnimationFrame(() => requestAnimationFrame(() => modalEl.classList.add('show')));
        });
    },
};
