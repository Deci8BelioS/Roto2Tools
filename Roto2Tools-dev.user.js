// ==UserScript==
// @id              Roto2Tools DEV
// @name            Roto2Tools DEV
// @namespace       Roto2Tools DEV
// @author          DeciBelioS
// @homepage        https://github.com/Deci8BelioS/Roto2Tools/
// @description     Script para Forocoches.
// @icon            https://raw.githubusercontent.com/Deci8BelioS/Roto2Tools/dev/resources/img/icon-48x48.png
// @icon64          https://raw.githubusercontent.com/Deci8BelioS/Roto2Tools/dev/resources/img/icon-64x64.png
// @updateURL       https://github.com/Deci8BelioS/Roto2Tools/raw/refs/heads/dev-2/Roto2Tools-dev.user.js
// @version         1.8.9d
// @encoding        UTF-8
// @match           *://www.forocoches.com/*
// @match           *://forocoches.com/*
// @grant           GM_setValue
// @grant           GM_getValue
// @grant           GM_deleteValue
// @grant           GM_xmlhttpRequest
// @grant           GM_addStyle
// @grant           GM_getMetadata
// @grant           GM_getResourceText
// @run-at          document-end
// @resource        bootstrapcss https://raw.githubusercontent.com/Deci8BelioS/Roto2Tools/refs/heads/dev-2/resources/require/bootstrapcss.css?v=1.8.9d
// @resource        Roto2Toolscss https://raw.githubusercontent.com/Deci8BelioS/Roto2Tools/refs/heads/dev-2/resources/require/Roto2Toolscss.css?v=1.8.9d
// @resource        toastcss https://raw.githubusercontent.com/Deci8BelioS/Roto2Tools/refs/heads/dev-2/resources/require/toastr.min.css?v=1.8.9d
// @resource        cust0mMensajes https://raw.githubusercontent.com/Deci8BelioS/Roto2Tools/refs/heads/dev-2/resources/require/cust0mMensajes.css?v=1.8.9d
// ==/UserScript==

(function () {
    'use strict';
    // ─────────────────────────────────────────────────────────────────────────────
    // CONFIGURACIÓN POR DEFECTO
    // ─────────────────────────────────────────────────────────────────────────────
    const DEFAULT_SETTINGS = {
        cust0mMensajes: true,
        expandirLayout: true,
        registrarHistorial: true,
        botonFavoritoHilo: true,
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
    const settings = {...DEFAULT_SETTINGS, ..._saved, colores: { ...DEFAULT_SETTINGS.colores, ...(_saved.colores || {}) }};
    const COLORS = settings.colores;
    // ─────────────────────────────────────────────────────────────────────────────
    // UTILIDADES
    // ─────────────────────────────────────────────────────────────────────────────
    function applyAccentGroups(str) {
        return str.replace(/[aáà]/gi, '[aáà]').replace(/[eéè]/gi, '[eéè]').replace(/[iíï]/gi, '[iíï]').replace(/[oóò]/gi, '[oóò]').replace(/[uúü]/gi, '[uúü]');
    }
    const Roto2ToolsUtils = {
        getRegex(userInput, isRegex, wholeWords = true) {
            if (isRegex) return new RegExp(userInput, 'i');
            let escaped = userInput.replace(/[-[\]\\/{}()*+?.,\\^$|#]/g, '\\$&');
            escaped = applyAccentGroups(escaped).replace(/[ ]*[,]+[ ]*$/, '').replace(/[ ]*[,]+[ ]*/g, '|');
            const core = `(${escaped})`;
            const pattern = wholeWords ? `(?<!\\w)${core}(?!\\w)` : core;
            try {
                return new RegExp(pattern, 'i');
            } catch {
                return new RegExp('(?!)');
            }
        },
        getRegexContacto(input, wholeWords = false) {
            const names = input.split(',').map(n => n.trim()).filter(Boolean);
            if (names.length === 0) return new RegExp('(?!)');
            const parts = names.map(name =>
                applyAccentGroups(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).replace(/\s+/g, '\\s+')
            );
            const joined = parts.join('|');
            const pattern = wholeWords ? `(?<!\\w)(${joined})(?!\\w)` : `(${joined})`;
            return new RegExp(pattern, 'i');
        },
        eliminarAdyacentes(hr) {
            while (true) {
                const next = hr.nextElementSibling;
                if (!next || next.tagName !== 'SEPARATOR') break;
                if (hr.getBoundingClientRect().bottom !== next.getBoundingClientRect().top) break;
                next.remove();
            }
        },
        applyButtonInteractionEffects(btn) {
            if (!btn) return;
            btn.addEventListener('mousedown', () => { btn.style.transform = 'translateY(3px)'; });
            btn.addEventListener('mouseup', () => { btn.style.transform = 'none'; });
            btn.addEventListener('mouseleave', () => { btn.style.transform = 'none'; });
        },
        applyTooltip(el, content) {
            if (el) el.title = content;
        },
        showToast(type, msg, title) {
            let container = document.getElementById('rt2-toast-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'rt2-toast-container';
                document.body.appendChild(container);
            }
            const toast = document.createElement('div');
            toast.className = `rt2-toast ${type}`;
            toast.innerHTML = (title ? `<strong>${title}</strong><br>` : '') + msg;
            const bar = document.createElement('div');
            bar.className = 'rt2-toast-bar';
            toast.appendChild(bar);
            container.appendChild(toast);
            requestAnimationFrame(() => {
                toast.style.opacity = '1';
                requestAnimationFrame(() => { bar.style.width = '0%'; });
            });
            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 350);
            }, 4000);
        },
        async fetchOnlineList(type) {
            const url = type === 'buddy' ? '/foro/profile.php?do=buddylist&nojs=1' : '/foro/profile.php?do=ignorelist&nojs=1';
            const response = await fetch(url);
            const text = await response.text();
            const doc = new DOMParser().parseFromString(text, 'text/html');
            const selector = type === 'buddy' ? 'div[id^="buddylist_user"] a[href*="member.php"]' : '#ignorelist li a[href*="member.php"]';
            return Array.from(doc.querySelectorAll(selector)).map(a => a.textContent.trim()).filter(Boolean);
        },
        getRealThreadData() {
            const params = new URLSearchParams(window.location.search);
            let id = params.get('t');
            let type = 't';
            if (!id) {
                const match = document.querySelector('a[onclick*="showthread.php?t="]')
                    ?.getAttribute('onclick')?.match(/[?&]t=(\d+)/);
                if (match) id = match[1];
            }
            if (!id) { id = params.get('p'); type = 'p'; }
            return id ? { id, type } : null;
        },
    };
    // ─────────────────────────────────────────────────────────────────────────────
    // HISTORIAL
    // ─────────────────────────────────────────────────────────────────────────────
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
    // ─────────────────────────────────────────────────────────────────────────────
    // DROPDOWN HISTORIAL / FAVORITOS
    // ─────────────────────────────────────────────────────────────────────────────
    function createHistoryDropdown(anchorEl) {
        const dropdown = document.createElement('div');
        dropdown.id = 'rt2-dropdown';
        document.body.appendChild(dropdown);
        dropdown.addEventListener('click', e => e.stopPropagation());
        const getFavorites = () => GM_getValue('rt2_favorites', []);
        const setFavorites = favs => GM_setValue('rt2_favorites', favs);
        const isFav = id => getFavorites().some(f => f.id === id);
        function toggleFav(item) {
            const currentFavs = getFavorites();
            const alreadyFav = currentFavs.some(f => f.id === item.id);
            const favs = alreadyFav ? currentFavs.filter(f => f.id !== item.id) : [{ id: item.id, title: item.title, type: item.type || 't' }, ...currentFavs];
            setFavorites(favs);
        }
        function positionDropdown() {
            const rect = anchorEl.getBoundingClientRect();
            dropdown.style.top = `${rect.bottom + window.scrollY + 6}px`;
            dropdown.style.left = `${Math.max(4, rect.right + window.scrollX - dropdown.offsetWidth)}px`;
        }
        function buildItem(item, tab) {
            const row = document.createElement('div');
            row.className = 'rt2-dd-item';
            const isItemFav = isFav(item.id);
            const favBtn = document.createElement('button');
            favBtn.className = `rt2-dd-item-fav${isItemFav ? ' active' : ''}`;
            favBtn.innerHTML = '★';
            favBtn.title = isItemFav ? 'Quitar de favoritos' : 'Añadir a favoritos';
            favBtn.addEventListener('click', () => { toggleFav(item); renderDropdown(currentTab); });
            const link = document.createElement('a');
            link.href = `/foro/showthread.php?${item.type || 't'}=${item.id}`;
            link.textContent = item.title;
            link.title = item.title;
            const delBtn = document.createElement('button');
            delBtn.className = 'rt2-dd-item-del';
            delBtn.innerHTML = '✕';
            delBtn.title = tab === 'history' ? 'Quitar del historial' : 'Quitar de favoritos';
            delBtn.addEventListener('click', () => {
                if (tab === 'history') {
                    GM_setValue('rt2_history', GM_getValue('rt2_history', []).filter(h => h.id !== item.id));
                } else {
                    setFavorites(getFavorites().filter(f => f.id !== item.id));
                }
                renderDropdown(currentTab);
            });
            row.append(favBtn, link);
            if (item.date) {
                const dateEl = document.createElement('span');
                dateEl.className = 'rt2-dd-item-date';
                dateEl.textContent = item.date;
                row.appendChild(dateEl);
            }
            row.appendChild(delBtn);
            return row;
        }
        let currentTab = 'history';
        function renderDropdown(tab) {
            currentTab = tab;
            dropdown.innerHTML = '';
            const tabsBar = document.createElement('div');
            tabsBar.className = 'rt2-dd-tabs';
            for (const t of ['history', 'favorites']) {
                const btn = document.createElement('button');
                btn.className = `rt2-dd-tab${t === tab ? ' active' : ''}`;
                btn.innerHTML = t === 'history' ? '<i class="fa-solid fa-clock-rotate-left"></i> Historial' : '<i class="fa-solid fa-star"></i> Favoritos';
                btn.addEventListener('click', () => renderDropdown(t));
                tabsBar.appendChild(btn);
            }
            dropdown.appendChild(tabsBar);
            const panel = document.createElement('div');
            panel.className = 'rt2-dd-panel active';
            const items = tab === 'history' ? GM_getValue('rt2_history', []) : getFavorites();
            if (items.length === 0) {
                const empty = document.createElement('div');
                empty.className = 'rt2-dd-empty';
                empty.textContent = tab === 'history' ? 'No hay hilos en el historial.' : 'No tienes favoritos guardados.';
                panel.appendChild(empty);
            } else {
                items.forEach(item => panel.appendChild(buildItem(item, tab)));
            }
            dropdown.appendChild(panel);
            const footer = document.createElement('div');
            footer.className = 'rt2-dd-footer';
            const clearBtn = document.createElement('button');
            clearBtn.innerHTML = `<i class="fa-solid fa-trash"></i> Borrar ${tab === 'history' ? 'historial' : 'favoritos'}`;
            clearBtn.addEventListener('click', () => {
                if (confirm(`¿Borrar ${tab === 'history' ? 'el historial' : 'todos los favoritos'}?`)) {
                    tab === 'history' ? GM_setValue('rt2_history', []) : setFavorites([]);
                    renderDropdown(tab);
                    Roto2ToolsUtils.showToast('info', `${tab === 'history' ? 'Historial' : 'Favoritos'} borrado.`, 'Roto2Tools');
                }
            });
            footer.appendChild(clearBtn);
            dropdown.appendChild(footer);
            requestAnimationFrame(positionDropdown);
        }
        anchorEl.addEventListener('click', e => {
            e.stopPropagation();
            if (dropdown.classList.contains('visible')) {
                dropdown.classList.remove('visible');
            } else {
                renderDropdown(currentTab);
                dropdown.classList.add('visible');
                positionDropdown();
            }
        });
        document.addEventListener('click', () => dropdown.classList.remove('visible'));
        window.addEventListener('resize', () => {
            if (dropdown.classList.contains('visible')) positionDropdown();
        });
        window.addEventListener('scroll', () => {
            if (dropdown.classList.contains('visible')) positionDropdown();
        }, true);
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // BOTÓN FAVORITO EN HILO
    // Ahora respeta settings.botonFavoritoHilo
    // ─────────────────────────────────────────────────────────────────────────────
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
    // ─────────────────────────────────────────────────────────────────────────────
    // MENÚ PRINCIPAL
    // ─────────────────────────────────────────────────────────────────────────────
    const Roto2ToolsMenu = {
        create(options) {
            const {initialResaltarHilos, initialOcultarHilos, initialResaltarContactos, initialOcultarContactos, onSave, scriptVersion} = options;
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
            const btnWrapper = document.createElement('span');
            btnWrapper.id = 'rt2-btn-wrapper';
            btnWrapper.append(menuBtn, histBtn);
            const container = document.querySelector('#searchform-desktop');
            if (container?.parentNode) {
                container.parentNode.insertBefore(btnWrapper, container.nextSibling);
            } else {
                btnWrapper.classList.add('rt2-btn-wrapper-fixed');
                document.body.appendChild(btnWrapper);
            }
            createHistoryDropdown(histBtn);
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
            const resaltarHilosComp = createTagInputComponent('Resaltar Hilos', 'Añadir palabra...', initialResaltarHilos);
            const ocultarHilosComp = createTagInputComponent('Ocultar Hilos', 'Añadir palabra...', initialOcultarHilos);
            const ocultarContactosComp = createTagInputComponent('Ocultar Usuarios', 'Añadir usuario...', initialOcultarContactos, 'ignore');
            const resaltarContactosComp = createTagInputComponent('Resaltar Usuarios', 'Añadir usuario...', initialResaltarContactos, 'buddy');
            // ── SECCIÓN AJUSTES ───────────────────────────────────────────────────
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
            // ── SECCIÓN ACERCA DE ─────────────────────────────────────────────────
            function createAboutSection() {
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
            const settingsSection = createSettingsSection();
            const aboutSection = createAboutSection();
            const sectionsConfig = [
                { id: 'resaltar-hilos', title: 'Resaltar Hilos', icon: 'fa-solid fa-star', content: resaltarHilosComp.element, color: COLORS.highlightThread, active: true },
                { id: 'ocultar-hilos', title: 'Ocultar Hilos', icon: 'fa-solid fa-eye-slash', content: ocultarHilosComp.element, color: COLORS.hideThread },
                { id: 'resaltar-users', title: 'Resaltar Usuarios', icon: 'fa-solid fa-user-check', content: resaltarContactosComp.element, color: COLORS.highlightContact },
                { id: 'ocultar-users', title: 'Ocultar Usuarios', icon: 'fa-solid fa-user-slash', content: ocultarContactosComp.element, color: COLORS.hideContact },
                { id: 'ajustes', title: 'Ajustes', icon: 'fa-solid fa-gear', content: settingsSection.element, color: '#a0a8ff' },
                { id: 'acerca-de', title: 'Acerca de', icon: 'fa-solid fa-circle-info', content: aboutSection.element, color: COLORS.info },
            ];
            const makeEl = (tag, cls) => { const e = document.createElement(tag); if (cls) e.className = cls; return e; };
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
                if (sec.active) { navLink.classList.add('active'); pane.classList.add('active'); }
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
                setTimeout(() => { modalEl.style.display = 'none'; }, 300);
            };
            cerrarBtn.addEventListener('click', closeModal);
            modalCloseX.addEventListener('click', closeModal);
            document.addEventListener('keydown', e => {
                if (e.key === 'Escape' && modalEl.style.display !== 'none') closeModal();
            });
            modalEl.addEventListener('click', e => { if (e.target === modalEl) closeModal(); });
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
    // ─────────────────────────────────────────────────────────────────────────────
    // PROCESADO
    // ─────────────────────────────────────────────────────────────────────────────
    const Roto2ToolsProcessing = {
        processThreads({ ocultarHilos, resaltarHilos, ocultarContactos, resaltarContactos }) {
            const elementos = document.querySelectorAll('section.without-bottom-corners > div');
            const threadContainer = document.querySelector('main > div > section');
            const elementosOcultos = [];
            const favorites = GM_getValue('rt2_favorites', []);
            const favIds = new Set(favorites.map(f => String(f.id)));
            const hideContactPairs = ocultarContactos.map(p => [p, Roto2ToolsUtils.getRegex(p, false, true)]);
            const highlightContactPairs = resaltarContactos.map(p => [p, Roto2ToolsUtils.getRegex(p, false, true)]);
            const hideHilosPairs = ocultarHilos.map(p => [p, Roto2ToolsUtils.getRegex(p, false, true)]);
            const highlightHilosPairs = resaltarHilos.map(p => [p, Roto2ToolsUtils.getRegex(p, false, true)]);
            elementos.forEach(el => {
                const titleAnchor = el.querySelector('[id*="thread_title_"]');
                const tituloSpan = titleAnchor?.querySelector('span');
                if (!tituloSpan) return;
                const threadId = titleAnchor.id.replace('thread_title_', '');
                if (favIds.has(threadId)) {
                    el.style.backgroundColor = '#646400';
                    el.style.textShadow = '0px 2px 4px #000';
                    const forumIcon = el.querySelector('.forum_title_icon');
                    if (forumIcon) {
                        const star = document.createElement('span');
                        star.className = 'rt2-fav-star-icon';
                        star.style.cssText = 'color:#ffff00;width:100%;max-width:24px;height:28px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;margin-right:0;';
                        star.innerHTML = '<i class="fa-solid fa-star"></i>';
                        forumIcon.replaceWith(star);
                    }
                }
                const titleLink = [...el.querySelectorAll('a')].find(a => a.innerText.trim().startsWith('@'));
                const textTitle = titleLink?.innerText.toLowerCase() ?? '';
                const textoTituloSpan = tituloSpan.innerText.toLowerCase();
                let modifiedHtml = tituloSpan.innerHTML;
                const hideContact = hideContactPairs.some(([, r]) => r.test(textTitle));
                const highlightContact = highlightContactPairs.some(([, r]) => r.test(textTitle));
                const matchedHide = hideHilosPairs.filter(([, r]) => r.test(textoTituloSpan)).map(([p]) => p);
                const matchedHighlight = highlightHilosPairs.filter(([, r]) => r.test(textoTituloSpan)).map(([p]) => p);
                const mustHide = hideContact || matchedHide.length > 0;
                const applyBaseStyles = mustHide || highlightContact || matchedHighlight.length > 0;
                if (hideContact) el.classList.add('rt2-thread-hide-contact');
                else if (highlightContact) el.classList.add('rt2-thread-highlight-contact');
                else if (matchedHide.length) el.classList.add('rt2-thread-hide');
                else if (matchedHighlight.length) el.classList.add('rt2-thread-highlight');
                if (applyBaseStyles) tituloSpan.classList.add('rt2-thread-title-white');
                if ((hideContact || highlightContact) && titleLink?.parentNode) {
                    const atIdx = textTitle.indexOf('@');
                    const dashIdx = textTitle.indexOf('-', atIdx);
                    const nick = textTitle.substring(atIdx, dashIdx !== -1 ? dashIdx : undefined).trim();
                    const resto = dashIdx !== -1 ? textTitle.substring(dashIdx + 1).trim() : '';
                    const color = hideContact ? COLORS.hideContact : COLORS.highlightContact;
                    const newSpan = document.createElement('span');
                    newSpan.innerHTML =
                        `<span style="color:${color};font-weight:bold;font-size:.75rem;text-shadow:0px 2px 4px #000;">${nick}</span>` +
                        ` <span style="color:var(--gray-text);font-size:.75rem;">${resto}</span>`;
                    titleLink.parentNode.insertBefore(newSpan, titleLink);
                    titleLink.remove();
                }
                const applyKeywordColor = (keywords, color) => {
                    keywords.forEach(p => {
                        const r = new RegExp(Roto2ToolsUtils.getRegex(p, false, true).source, 'ig');
                        modifiedHtml = modifiedHtml.replace(r, m =>
                            `<span style="font-weight:bold;color:${color};">${m}</span>`);
                    });
                };
                if (matchedHighlight.length) applyKeywordColor(matchedHighlight, COLORS.highlightThread);
                if (matchedHide.length) applyKeywordColor(matchedHide, COLORS.hideThread);
                if (matchedHighlight.length || matchedHide.length) tituloSpan.innerHTML = modifiedHtml;
                if (mustHide) elementosOcultos.push(el);
            });
            if (elementosOcultos.length > 0 && threadContainer) {
                const hiddenContainer = document.createElement('div');
                hiddenContainer.className = 'rt2-hidden-threads-container';
                hiddenContainer.style.maxHeight = '0px';
                elementosOcultos.forEach(el => {
                    el.classList.add('rt2-hidden-thread-item');
                    hiddenContainer.appendChild(el);
                });
                const spoilerBtn = document.createElement('div');
                spoilerBtn.className = 'rt2-spoiler-btn';
                spoilerBtn.textContent = `${elementosOcultos.length} Hilo(s) oculto(s)`;
                Roto2ToolsUtils.applyTooltip(spoilerBtn, 'Haz clic para mostrar/ocultar los hilos');
                Roto2ToolsUtils.applyButtonInteractionEffects(spoilerBtn);
                spoilerBtn.addEventListener('click', () => {
                    const isHidden = hiddenContainer.style.maxHeight === '0px';
                    spoilerBtn.textContent = isHidden ? `${elementosOcultos.length} Hilo(s) mostrando` : `${elementosOcultos.length} Hilo(s) oculto(s)`;
                    hiddenContainer.style.maxHeight = isHidden ? `${hiddenContainer.scrollHeight}px` : '0px';
                    spoilerBtn.style.backgroundColor = isHidden ? '#4a4a4a' : '';
                });
                const onResize = () => {
                    if (hiddenContainer.style.maxHeight !== '0px')
                        hiddenContainer.style.maxHeight = `${hiddenContainer.scrollHeight}px`;
                };
                window.addEventListener('resize', onResize);
                threadContainer.append(hiddenContainer, spoilerBtn);
            }
        },
        processMessages({ ocultarContactos, resaltarContactos }) {
            const postmenus = document.querySelectorAll('div[id*="postmenu"], section.without-bottom-corners');
            if (resaltarContactos.length > 0) {
                const regex = Roto2ToolsUtils.getRegexContacto(resaltarContactos.join(','), true);
                postmenus.forEach(postmenu => {
                    const userLink = postmenu.querySelector('a[href*="member.php"]');
                    if (!userLink || userLink.classList.contains('rt2-resaltado')) return;
                    if (!regex.test(userLink.textContent.trim())) return;
                    userLink.classList.add('rt2-resaltado');
                    postmenu.closest('[id^="post"]')?.closest('[id^="edit"]')
                        ?.querySelector('section')?.classList.add('rt2-resaltado');
                });
            }
            if (ocultarContactos.length > 0) {
                const regex = Roto2ToolsUtils.getRegexContacto(ocultarContactos.join(','), true);
                postmenus.forEach(postmenu => {
                    const userLink = postmenu.querySelector(
                        'a[href*="member.php?u="], a[href*="member.php?userid="], a[href*="member.php"]'
                    );
                    if (!userLink || !regex.test(userLink.textContent.trim())) return;
                    const sectionEl = postmenu.matches('section') ? postmenu : postmenu.querySelector('section');
                    const editEl = postmenu.closest('[id^="edit"]') || postmenu.closest('[id^="post"]') || sectionEl || postmenu;
                    if (!editEl || editEl.classList.contains('rt2-oculto')) return;
                    const targetEl = sectionEl || editEl;
                    if (targetEl.classList.contains('rt2-oculto')) return;
                    targetEl.classList.add('rt2-oculto');
                    editEl.classList.add('rt2-oculto');
                    editEl.querySelector('separator-large')?.remove();
                    const spoiler = document.createElement('details');
                    spoiler.className = 'spoiler';
                    const summary = document.createElement('summary');
                    summary.innerText = 'El mensaje de este usuario está oculto porque está en la lista de Ocultar Usuarios';
                    if (editEl.parentNode) {
                        editEl.parentNode.insertBefore(spoiler, editEl);
                        spoiler.append(summary, editEl);
                    }
                });
                document.querySelectorAll('.quote').forEach(quoteEl => {
                    const boldAuthor = quoteEl.querySelector('div > div:first-child b');
                    if (!boldAuthor || quoteEl.classList.contains('processed-quote')) return;
                    const author = boldAuthor.innerText.trim();
                    if (!regex.test(author)) return;
                    quoteEl.classList.add('processed-quote');
                    const original = quoteEl.innerHTML;
                    quoteEl.innerHTML = '';
                    const details = document.createElement('details');
                    details.className = 'spoiler-quote';
                    const summary = document.createElement('summary');
                    summary.textContent = `Cita de ${author} (oculto)`;
                    const inner = document.createElement('div');
                    inner.innerHTML = original;
                    details.append(summary, inner);
                    quoteEl.appendChild(details);
                });
            }
        },
        cleanupSeparators() {
            document.querySelectorAll('separator').forEach(
                sep => Roto2ToolsUtils.eliminarAdyacentes(sep)
            );
        },
        applyFinalStyles() {
            if (!settings.expandirLayout) return;
            const header = document.getElementById('header');
            if (header) { header.style.maxWidth = 'unset'; header.style.width = '100%'; }
            const main = document.querySelector('main');
            if (main) {
                main.style.margin = '0';
                main.style.width = '100%';
                main.style.maxWidth = 'unset';
                main.style.gridTemplateColumns = '1fr auto';
            }
        },
    };
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
    // ─────────────────────────────────────────────────────────────────────────────
    // INIT
    // ─────────────────────────────────────────────────────────────────────────────
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
})();
