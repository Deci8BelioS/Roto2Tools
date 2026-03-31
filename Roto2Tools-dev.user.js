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
// @version         1.8.0d
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
// @resource        bootstrapcss https://raw.githubusercontent.com/Deci8BelioS/Roto2Tools/refs/heads/dev-1/resources/require/bootstrapcss.css
// @resource        Roto2Toolscss https://raw.githubusercontent.com/Deci8BelioS/Roto2Tools/refs/heads/dev-1/resources/require/Roto2Toolscss.css
// @resource        toastrcss https://raw.githubusercontent.com/Deci8BelioS/Roto2Tools/refs/heads/dev-1/resources/require/toastr.min.css
// ==/UserScript==
(function () {
    'use strict';
    const Roto2ToolsUtils = {
        getRegex: function (userInput, isRegex, wholeWords) {
            if (isRegex) return new RegExp(userInput, 'i');
            let escapedInput = userInput.replace(/[-[\]\/{}()*+?.\\\^$|]/g, '\\$&');
            escapedInput = escapedInput
                .replace(/[aáà]/gi, '[aáà]').replace(/[eéè]/gi, '[eéè]')
                .replace(/[iíï]/gi, '[iíï]').replace(/[oóò]/gi, '[oóò]')
                .replace(/[uúü]/gi, '[uúü]')
                .replace(/[ ]*[,]+[ ]*$/, '').replace(/[ ]*[,]+[ ]*/g, '|');
            const corePattern = `(${escapedInput})`;
            let regexString = (typeof wholeWords === 'undefined' || wholeWords)
                ? `(?<!\\w)${corePattern}(?!\\w)`
                : corePattern;
            try { return new RegExp(regexString, 'i'); } catch (e) { return new RegExp('(?!)'); }
        },
        getRegexcontacto: function (userInputcontacto, wholeWordscontacto) {
            const names = userInputcontacto.split(',').map(n => n.trim()).filter(n => n.length > 0);
            if (names.length === 0) return new RegExp('(?!)');
            const escapedNames = names.map(name => {
                let escaped = name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                return escaped
                    .replace(/[aáà]/gi, '[aáà]').replace(/[eéè]/gi, '[eéè]')
                    .replace(/[iíï]/gi, '[iíï]').replace(/[oóò]/gi, '[oóò]')
                    .replace(/[uúü]/gi, '[uúü]');
            });
            let regexString = escapedNames.join('|');
            if (wholeWordscontacto) regexString = `\\b(${regexString})\\b`;
            return new RegExp(regexString, 'i');
        },
        eliminarAdyacentes: function (hr) {
            let nextHr = hr.nextElementSibling;
            if (nextHr && nextHr.tagName === 'SEPARATOR' && hr.getBoundingClientRect().bottom === nextHr.getBoundingClientRect().top) {
                nextHr.remove();
                if (hr.nextElementSibling) this.eliminarAdyacentes(hr);
            }
        },
        applyButtonInteractionEffects: function (btn) {
            if (!btn) return;
            btn.addEventListener('mousedown', () => { btn.style.boxShadow = 'none'; btn.style.transform = 'translateY(3px)'; });
            btn.addEventListener('mouseup', () => { btn.style.boxShadow = '0px 2px 4px #000000'; btn.style.transform = 'none'; });
            btn.addEventListener('mouseleave', () => { btn.style.boxShadow = '0px 2px 4px #000000'; btn.style.transform = 'none'; });
        },
        applyTooltip: function (el, content) { if (el) el.title = content; },
        showToast: function (type, msg, title) {
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
            setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 350); }, 4000);
        },
        fetchOnlineList: async function (type) {
            const url = type === 'buddy' ? '/foro/profile.php?do=buddylist&nojs=1' : '/foro/profile.php?do=ignorelist&nojs=1';
            const response = await fetch(url);
            const text = await response.text();
            const doc = new DOMParser().parseFromString(text, 'text/html');
            const anchors = type === 'buddy'
                ? doc.querySelectorAll('div[id^="buddylist_user"] a[href*="member.php"]')
                : doc.querySelectorAll('#ignorelist li a[href*="member.php"]');
            return Array.from(anchors).map(a => a.textContent.trim()).filter(Boolean);
        }
    };
    function trackHistory() {
        const params = new URLSearchParams(window.location.search);
        const threadId = params.get('t');
        if (!threadId) return;
        let title = document.title.replace(' - ForoCoches', '').trim();
        const h1 = document.querySelector('.pull-left > h1') || document.querySelector('h1');
        if (h1 && h1.innerText) title = h1.innerText.trim();
        let history = GM_getValue('rt2_history', []);
        history = history.filter(item => item.id !== threadId);
        history.unshift({ id: threadId, title, date: new Date().toLocaleString() });
        if (history.length > 100) history.pop();
        GM_setValue('rt2_history', history);
    }
    function createHistoryDropdown(anchorEl) {
        const dropdown = document.createElement('div');
        dropdown.id = 'rt2-dropdown';
        document.body.appendChild(dropdown);
        dropdown.addEventListener('click', (e) => { e.stopPropagation(); });
        function positionDropdown() {
            const rect = anchorEl.getBoundingClientRect();
            dropdown.style.top = (rect.bottom + window.scrollY + 6) + 'px';
            const left = rect.right + window.scrollX - dropdown.offsetWidth;
            dropdown.style.left = Math.max(4, left) + 'px';
        }
        function getFavorites() { return GM_getValue('rt2_favorites', []); }
        function setFavorites(f) { GM_setValue('rt2_favorites', f); }
        function isFav(id) { return getFavorites().some(f => f.id === id); }
        function toggleFav(id, title) {
            let favs = getFavorites();
            favs = isFav(id) ? favs.filter(f => f.id !== id) : [{ id, title }, ...favs];
            setFavorites(favs);
        }
        function buildItem(item, tab) {
            const row = document.createElement('div');
            row.className = 'rt2-dd-item';
            const favBtn = document.createElement('button');
            favBtn.className = 'rt2-dd-item-fav' + (isFav(item.id) ? ' active' : '');
            favBtn.innerHTML = '★';
            favBtn.title = isFav(item.id) ? 'Quitar de favoritos' : 'Añadir a favoritos';
            favBtn.addEventListener('click', () => { toggleFav(item.id, item.title); renderDropdown(currentTab); });
            const link = document.createElement('a');
            link.href = `/foro/showthread.php?t=${item.id}`;
            link.textContent = item.title;
            link.title = item.title;
            const delBtn = document.createElement('button');
            delBtn.className = 'rt2-dd-item-del';
            delBtn.innerHTML = '✕';
            delBtn.title = tab === 'history' ? 'Quitar del historial' : 'Quitar de favoritos';
            delBtn.addEventListener('click', () => {
                if (tab === 'history') {
                    let hist = GM_getValue('rt2_history', []);
                    GM_setValue('rt2_history', hist.filter(h => h.id !== item.id));
                } else {
                    setFavorites(getFavorites().filter(f => f.id !== item.id));
                }
                renderDropdown(currentTab);
            });
            row.appendChild(favBtn);
            row.appendChild(link);
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
            ['history', 'favorites'].forEach(t => {
                const btn = document.createElement('button');
                btn.className = 'rt2-dd-tab' + (t === tab ? ' active' : '');
                btn.innerHTML = t === 'history'
                    ? '<i class="fa-solid fa-clock-rotate-left"></i> Historial'
                    : '<i class="fa-solid fa-star"></i> Favoritos';
                btn.addEventListener('click', () => renderDropdown(t));
                tabsBar.appendChild(btn);
            });
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
            clearBtn.innerHTML = '<i class="fa-solid fa-trash"></i> Borrar ' + (tab === 'history' ? 'historial' : 'favoritos');
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
        anchorEl.addEventListener('click', (e) => {
            e.stopPropagation();
            if (dropdown.classList.contains('visible')) {
                dropdown.classList.remove('visible');
            } else {
                renderDropdown(currentTab);
                dropdown.classList.add('visible');
                positionDropdown();
            }
        });
        document.addEventListener('click', () => { dropdown.classList.remove('visible'); });
        window.addEventListener('resize', () => { if (dropdown.classList.contains('visible')) positionDropdown(); });
        window.addEventListener('scroll', () => { if (dropdown.classList.contains('visible')) positionDropdown(); }, true);
        return {
            toggle: () => {
                if (dropdown.classList.contains('visible')) {
                    dropdown.classList.remove('visible');
                } else {
                    renderDropdown(currentTab);
                    dropdown.classList.add('visible');
                    positionDropdown();
                }
            }
        };
    }
    function injectFavoriteButtonInThread() {
        const params = new URLSearchParams(window.location.search);
        const threadId = params.get('t');
        if (!threadId) return;
        const h1 = document.querySelector('#container > section h1')
            || document.querySelector('.without-bottom-corners h1')
            || document.querySelector('h1');
        if (!h1) return;
        const title = h1.innerText.trim();
        const isFavNow = GM_getValue('rt2_favorites', []).some(f => f.id === threadId);
        const star = document.createElement('button');
        star.id = 'rt2-fav-thread-btn';
        star.title = isFavNow ? 'Quitar de favoritos' : 'Añadir a favoritos';
        star.textContent = isFavNow ? '★' : '☆';
        if (isFavNow) star.classList.add('is-fav');
        star.addEventListener('click', () => {
            let f = GM_getValue('rt2_favorites', []);
            if (f.some(x => x.id === threadId)) {
                f = f.filter(x => x.id !== threadId);
                star.textContent = '☆';
                star.classList.remove('is-fav');
                star.title = 'Añadir a favoritos';
                Roto2ToolsUtils.showToast('info', 'Eliminado de favoritos.', 'Roto2Tools');
            } else {
                f.unshift({ id: threadId, title });
                star.textContent = '★';
                star.classList.add('is-fav');
                star.title = 'Quitar de favoritos';
                Roto2ToolsUtils.showToast('success', 'Añadido a favoritos.', 'Roto2Tools');
            }
            GM_setValue('rt2_favorites', f);
        });
        h1.parentNode.insertBefore(star, h1.nextSibling);
    }
    const Roto2ToolsMenu = {
        create: function (options) {
            const { initialResaltarHilos, initialOcultarHilos, initialResaltarContactos, initialOcultarContactos, onSave, scriptVersion } = options;
            const Roto2ToolsContainer = document.querySelector('#searchform-desktop');
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
            btnWrapper.appendChild(menuBtn);
            btnWrapper.appendChild(histBtn);
            if (Roto2ToolsContainer && Roto2ToolsContainer.parentNode) {
                Roto2ToolsContainer.parentNode.insertBefore(btnWrapper, Roto2ToolsContainer.nextSibling);
            } else {
                btnWrapper.classList.add('rt2-btn-wrapper-fixed');
                document.body.appendChild(btnWrapper);
            }
            createHistoryDropdown(histBtn);
            function createTagInputComponent(title, placeholder, initialValues = [], importType = null) {
                let currentTags = new Set(
                    Array.isArray(initialValues) ? initialValues.map(t => String(t).trim()).filter(Boolean) : []
                );
                const container = document.createElement('div');
                container.className = 'tag-input-component';
                const header = document.createElement('div');
                header.className = 'tag-input-header';
                const headerTitle = document.createElement('h2');
                headerTitle.innerText = title;
                const countElement = document.createElement('span');
                countElement.className = 'tag-count';
                headerTitle.appendChild(countElement);
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
                            let addedCount = 0;
                            users.forEach(u => { if (!currentTags.has(u)) { currentTags.add(u); renderTag(u); addedCount++; } });
                            updateCount();
                            Roto2ToolsUtils.showToast(addedCount > 0 ? 'success' : 'info',
                                addedCount > 0 ? `Importados ${addedCount} usuario(s).` : 'No hay usuarios nuevos.', 'Roto2Tools');
                        } catch (e) { Roto2ToolsUtils.showToast('error', 'Error al importar la lista.', 'Roto2Tools'); }
                    });
                    btnContainer.appendChild(importBtn);
                }
                const clearBtn = document.createElement('button');
                clearBtn.type = 'button';
                clearBtn.className = 'clear-list-btn';
                clearBtn.innerHTML = '<i class="fa-solid fa-trash"></i> Limpiar lista';
                clearBtn.addEventListener('click', () => {
                    if (confirm('¿Borrar toda la lista?')) { currentTags.clear(); tagsDisplay.innerHTML = ''; updateCount(); }
                });
                btnContainer.appendChild(clearBtn);
                header.appendChild(headerTitle);
                header.appendChild(btnContainer);
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
                function updateCount() { countElement.innerText = ` (${currentTags.size})`; }
                function renderTag(text) {
                    const tag = document.createElement('span');
                    tag.className = 'tag';
                    tag.dataset.value = text;
                    const tagText = document.createElement('span');
                    tagText.innerText = text;
                    const deleteBtn = document.createElement('span');
                    deleteBtn.className = 'delete-tag';
                    deleteBtn.innerHTML = '&times;';
                    deleteBtn.addEventListener('click', () => { currentTags.delete(text); tag.remove(); updateCount(); });
                    tag.appendChild(tagText);
                    tag.appendChild(deleteBtn);
                    tagsDisplay.appendChild(tag);
                    tagsDisplay.scrollTop = tagsDisplay.scrollHeight;
                }
                function addFromInput() {
                    const val = input.value.trim();
                    if (val && !Array.from(currentTags).map(t => t.toLowerCase()).includes(val.toLowerCase())) {
                        currentTags.add(val); renderTag(val); input.value = ''; updateCount();
                    }
                    input.focus();
                }
                addButton.addEventListener('click', addFromInput);
                input.addEventListener('keypress', e => { if (e.key === 'Enter') { e.preventDefault(); addFromInput(); } });
                currentTags.forEach(t => renderTag(t));
                updateCount();
                controls.appendChild(input);
                controls.appendChild(addButton);
                container.appendChild(header);
                container.appendChild(tagsDisplay);
                container.appendChild(controls);
                return {
                    element: container,
                    getValues: () => Array.from(currentTags),
                    setValues: (vals) => { currentTags.clear(); tagsDisplay.innerHTML = ''; vals.forEach(v => { currentTags.add(v); renderTag(v); }); updateCount(); }
                };
            }
            const resaltarHilosComp = createTagInputComponent('Resaltar Hilos', 'Añadir palabra...', initialResaltarHilos);
            const ocultarHilosComp = createTagInputComponent('Ocultar Hilos', 'Añadir palabra...', initialOcultarHilos);
            const ocultarContactosComp = createTagInputComponent('Ocultar Usuarios', 'Añadir usuario...', initialOcultarContactos, 'ignore');
            const resaltarContactosComp = createTagInputComponent('Resaltar Usuarios', 'Añadir usuario...', initialResaltarContactos, 'buddy');
            const sectionsConfig = [
                { id: 'resaltar-hilos', title: 'Resaltar Hilos', icon: 'fa-solid fa-star', content: resaltarHilosComp.element, color: '#EDD40E', active: true },
                { id: 'ocultar-hilos', title: 'Ocultar Hilos', icon: 'fa-solid fa-eye-slash', content: ocultarHilosComp.element, color: '#FD5D4D' },
                { id: 'resaltar-users', title: 'Resaltar Usuarios', icon: 'fa-solid fa-user-check', content: resaltarContactosComp.element, color: '#2FC726' },
                { id: 'ocultar-users', title: 'Ocultar Usuarios', icon: 'fa-solid fa-user-slash', content: ocultarContactosComp.element, color: '#FF2626' },
            ];
            const modalElement = document.createElement('div');
            modalElement.className = 'modal fade';
            modalElement.id = 'roto2ToolsModal';
            modalElement.setAttribute('tabindex', '-1');
            modalElement.setAttribute('role', 'dialog');
            modalElement.setAttribute('aria-modal', 'true');
            const modalDialog = document.createElement('div'); modalDialog.className = 'modal-dialog modal-xl';
            const modalContent = document.createElement('div'); modalContent.className = 'modal-content modal-glassmorphism roto2tools-modal-content';
            const modalHeader = document.createElement('div'); modalHeader.className = 'modal-header';
            const versionText = scriptVersion ? ` <small class="rt2-version-text">v${scriptVersion}</small>` : '';
            modalHeader.innerHTML = `<h2 class="modal-title"><img src="https://forocoches.com/foro/images/smilies/goofy.gif" alt="goofy"> Roto2Tools Panel${versionText}</h2>`;
            const modalBody = document.createElement('div'); modalBody.className = 'modal-body';
            const mainLayout = document.createElement('div'); mainLayout.className = 'roto2tools-main-layout';
            const navContainer = document.createElement('div'); navContainer.className = 'roto2tools-nav';
            const contentContainer = document.createElement('div'); contentContainer.className = 'roto2tools-content';
            sectionsConfig.forEach(sec => {
                const navLink = document.createElement('a');
                navLink.href = '#';
                navLink.className = 'roto2tools-nav-link';
                navLink.dataset.target = sec.id;
                navLink.setAttribute('role', 'tab');
                navLink.innerHTML = `<i class="${sec.icon}" style="color:${sec.color};"></i> <span>${sec.title}</span>`;
                const contentPane = document.createElement('div');
                contentPane.className = 'roto2tools-content-pane';
                contentPane.id = sec.id;
                contentPane.setAttribute('role', 'tabpanel');
                contentPane.appendChild(sec.content);
                if (sec.active) { navLink.classList.add('active'); contentPane.classList.add('active'); }
                navLink.addEventListener('click', e => {
                    e.preventDefault();
                    navContainer.querySelectorAll('.roto2tools-nav-link').forEach(l => l.classList.remove('active'));
                    contentContainer.querySelectorAll('.roto2tools-content-pane').forEach(c => c.classList.remove('active'));
                    navLink.classList.add('active');
                    contentPane.classList.add('active');
                });
                navContainer.appendChild(navLink);
                contentContainer.appendChild(contentPane);
            });
            mainLayout.appendChild(navContainer);
            mainLayout.appendChild(contentContainer);
            modalBody.appendChild(mainLayout);
            const modalFooter = document.createElement('div'); modalFooter.className = 'modal-footer';
            const cerrarBtn = document.createElement('button');
            cerrarBtn.className = 'rt2-button rt2-button-close';
            cerrarBtn.innerHTML = '<i class="fa-solid fa-xmark"></i> Cerrar';
            const guardarBtn = document.createElement('button');
            guardarBtn.className = 'rt2-button rt2-button-save';
            guardarBtn.innerHTML = '<i class="fa-solid fa-save"></i> Guardar y Recargar';
            const closeModal = () => {
                modalElement.classList.remove('show');
                modalElement.setAttribute('aria-hidden', 'true');
                setTimeout(() => { modalElement.style.display = 'none'; }, 300);
            };
            cerrarBtn.addEventListener('click', closeModal);
            document.addEventListener('keydown', e => { if (e.key === 'Escape' && modalElement.style.display !== 'none') closeModal(); });
            modalElement.addEventListener('click', e => { if (e.target === modalElement) closeModal(); });
            guardarBtn.addEventListener('click', () => {
                onSave({
                    resaltarHilos: resaltarHilosComp.getValues(),
                    ocultarHilos: ocultarHilosComp.getValues(),
                    ocultarContactos: ocultarContactosComp.getValues(),
                    resaltarContactos: resaltarContactosComp.getValues()
                });
                Roto2ToolsUtils.showToast('success', 'Listas guardadas. Recargando...', 'Roto2Tools');
                closeModal();
                setTimeout(() => location.reload(), 1000);
            });
            modalFooter.appendChild(cerrarBtn);
            modalFooter.appendChild(guardarBtn);
            modalContent.appendChild(modalHeader);
            modalContent.appendChild(modalBody);
            modalContent.appendChild(modalFooter);
            modalDialog.appendChild(modalContent);
            modalElement.appendChild(modalDialog);
            document.body.appendChild(modalElement);
            menuBtn.addEventListener('click', () => {
                modalElement.style.display = 'block';
                modalElement.setAttribute('aria-hidden', 'false');
                requestAnimationFrame(() => requestAnimationFrame(() => modalElement.classList.add('show')));
            });
        }
    };
    const Roto2ToolsProcessing = {
        processThreads: function (options) {
            const { ocultarHilos, resaltarHilos, ocultarContactos, resaltarContactos } = options;
            const elementos = document.querySelectorAll('section.without-bottom-corners > div');
            const elementosOcultos = [];
            const threadContainer = document.querySelector('main>div>section');
            elementos.forEach(el => {
                const tituloSpan = el.querySelector('[id*="thread_title_"]>span');
                if (!tituloSpan) return;
                const titleLink = Array.from(el.querySelectorAll('a')).find(a => a.innerText.trim().startsWith('@'));
                const textTitle = titleLink ? titleLink.innerText.toLowerCase() : '';
                const textoTituloSpan = tituloSpan.innerText.toLowerCase();
                let originalTituloHtml = tituloSpan.innerHTML;
                let applyHideContactStyle = false, applyHighlightContactStyle = false;
                let applyHideThreadStyle = false, applyHighlightThreadStyle = false;
                let mustBeHidden = false, applyBaseStyles = false;
                if (ocultarContactos.some(p => Roto2ToolsUtils.getRegex(p, false, true).test(textTitle))) {
                    applyHideContactStyle = true; mustBeHidden = true; applyBaseStyles = true;
                }
                if (resaltarContactos.some(p => Roto2ToolsUtils.getRegex(p, false, true).test(textTitle))) {
                    applyHighlightContactStyle = true; applyBaseStyles = true;
                }
                const matchedHideKeywords = ocultarHilos.filter(p => Roto2ToolsUtils.getRegex(p, false, true).test(textoTituloSpan));
                if (matchedHideKeywords.length > 0) { applyHideThreadStyle = true; mustBeHidden = true; applyBaseStyles = true; }
                const matchedHighlightKeywords = resaltarHilos.filter(p => Roto2ToolsUtils.getRegex(p, false, true).test(textoTituloSpan));
                if (matchedHighlightKeywords.length > 0) { applyHighlightThreadStyle = true; applyBaseStyles = true; }
                let modifiedTitleHtml = originalTituloHtml;
                if (applyHideContactStyle) el.classList.add('rt2-thread-hide-contact');
                else if (applyHighlightContactStyle) el.classList.add('rt2-thread-highlight-contact');
                else if (applyHideThreadStyle) el.classList.add('rt2-thread-hide');
                else if (applyHighlightThreadStyle) el.classList.add('rt2-thread-highlight');
                if (applyBaseStyles) tituloSpan.classList.add('rt2-thread-title-white');
                if (applyHideContactStyle || applyHighlightContactStyle) {
                    const index = textTitle.indexOf('@');
                    if (index !== -1 && titleLink && titleLink.parentNode) {
                        const endIndex = textTitle.indexOf('-', index);
                        const nick = textTitle.substring(index, endIndex !== -1 ? endIndex : undefined).trim();
                        const resto = textTitle.substring(textTitle.indexOf('-', index) + 1).trim();
                        const newSpan = document.createElement('span');
                        const nickColor = applyHideContactStyle ? '#FF2626' : '#2FC726';
                        newSpan.innerHTML = `<span style="color:${nickColor};font-weight:bold;font-size:.75rem;text-shadow:0px 2px 4px #000;">${nick}</span> <span style="color:var(--gray-text);font-size:.75rem;">${resto}</span>`;
                        titleLink.parentNode.insertBefore(newSpan, titleLink);
                        titleLink.remove();
                    }
                }
                if (applyHighlightThreadStyle) {
                    matchedHighlightKeywords.forEach(p => {
                        const r = new RegExp(Roto2ToolsUtils.getRegex(p, false, true).source, 'ig');
                        modifiedTitleHtml = modifiedTitleHtml.replace(r, m => `<span style="font-weight:bold;color:#EDD40E;">${m}</span>`);
                    });
                }
                if (applyHideThreadStyle) {
                    matchedHideKeywords.forEach(p => {
                        const r = new RegExp(Roto2ToolsUtils.getRegex(p, false, true).source, 'ig');
                        modifiedTitleHtml = modifiedTitleHtml.replace(r, m => `<span style="font-weight:bold;color:#FD5D4D;">${m}</span>`);
                    });
                }
                if (applyHighlightThreadStyle || applyHideThreadStyle) tituloSpan.innerHTML = modifiedTitleHtml;
                if (mustBeHidden) elementosOcultos.push(el);
            });
            elementosOcultos.forEach(el => { if (el.parentNode) el.remove(); });
            if (elementosOcultos.length > 0 && threadContainer) {
                const contenedorOcultos = document.createElement('div');
                contenedorOcultos.className = 'rt2-hidden-threads-container';
                elementosOcultos.forEach(elemento => {
                    elemento.classList.add('rt2-hidden-thread-item');
                    contenedorOcultos.appendChild(elemento);
                });
                const spoilerBtn = document.createElement('div');
                spoilerBtn.className = 'rt2-spoiler-btn';
                spoilerBtn.textContent = `${elementosOcultos.length} Hilo(s) oculto(s)`;
                Roto2ToolsUtils.applyTooltip(spoilerBtn, 'Haz clic para mostrar/ocultar los hilos');
                Roto2ToolsUtils.applyButtonInteractionEffects(spoilerBtn);
                spoilerBtn.addEventListener('click', () => {
                    const isHidden = contenedorOcultos.style.maxHeight === '0px';
                    spoilerBtn.textContent = isHidden ? `${elementosOcultos.length} Hilo(s) mostrando` : `${elementosOcultos.length} Hilo(s) oculto(s)`;
                    contenedorOcultos.style.maxHeight = isHidden ? `${contenedorOcultos.scrollHeight}px` : '0px';
                    spoilerBtn.style.backgroundColor = isHidden ? '#4a4a4a' : '';
                });
                window.addEventListener('resize', () => {
                    if (contenedorOcultos.style.maxHeight !== '0px' && contenedorOcultos.scrollHeight)
                        contenedorOcultos.style.maxHeight = `${contenedorOcultos.scrollHeight}px`;
                });
                threadContainer.appendChild(contenedorOcultos);
                threadContainer.appendChild(spoilerBtn);
            }
        },
        processMessages: function (options) {
            const { ocultarContactos, resaltarContactos } = options;
            if (resaltarContactos.length > 0) {
                const regexResaltar = Roto2ToolsUtils.getRegexcontacto(resaltarContactos.join(','), true);
                document.querySelectorAll('div[id^="postmenu_"]').forEach(postmenu => {
                    const userLink = postmenu.querySelector('a[href*="member.php"]');
                    if (!userLink || userLink.classList.contains('resaltado')) return;
                    if (!regexResaltar.test(userLink.textContent.trim())) return;
                    userLink.classList.add('resaltado');
                    const section = postmenu.closest('[id^="post"]')
                        ?.closest('[id^="edit"]')
                        ?.querySelector('section');
                    if (section) section.classList.add('resaltado');
                });
            }
            if (ocultarContactos.length > 0) {
                const regexOcultar = Roto2ToolsUtils.getRegexcontacto(ocultarContactos.join(','), true);
                document.querySelectorAll('div[id^="postmenu_"]').forEach(postmenu => {
                    const userLink = postmenu.querySelector('a[href*="member.php"]');
                    if (!userLink) return;
                    if (!regexOcultar.test(userLink.textContent.trim())) return;
                    const editEl = postmenu.closest('[id^="post"]')?.closest('[id^="edit"]');
                    if (!editEl || editEl.classList.contains('oculto')) return;
                    const sectionEl = editEl.querySelector('section');
                    if (!sectionEl || sectionEl.classList.contains('oculto')) return;
                    sectionEl.classList.add('oculto');
                    editEl.classList.add('oculto');
                    const spoiler = document.createElement('details');
                    spoiler.className = 'spoiler';
                    const botonSpoiler = document.createElement('summary');
                    botonSpoiler.innerText = 'El mensaje de este usuario está oculto porque está en la lista de Ocultar Usuarios';
                    editEl.before(spoiler);
                    spoiler.appendChild(botonSpoiler);
                    spoiler.appendChild(editEl);
                    const sep = editEl.querySelector('separator-large');
                    if (sep) sep.remove();
                });
                const regexOcultarQuotes = Roto2ToolsUtils.getRegexcontacto(ocultarContactos.join(','), true);
                document.querySelectorAll('.quote').forEach(quoteElem => {
                    const boldAuthor = quoteElem.querySelector('div > div:first-child b');
                    if (!boldAuthor || quoteElem.classList.contains('processed-quote')) return;
                    const authorName = boldAuthor.innerText.trim();
                    if (!regexOcultarQuotes.test(authorName)) return;
                    quoteElem.classList.add('processed-quote');
                    const originalContent = quoteElem.innerHTML;
                    quoteElem.innerHTML = '';
                    const detailsEl = document.createElement('details');
                    detailsEl.className = 'spoiler-quote';
                    const summaryEl = document.createElement('summary');
                    summaryEl.textContent = `Cita de ${authorName} (oculto)`;
                    const innerDiv = document.createElement('div');
                    innerDiv.innerHTML = originalContent;
                    detailsEl.appendChild(summaryEl);
                    detailsEl.appendChild(innerDiv);
                    quoteElem.appendChild(detailsEl);
                });
            }
        },
        cleanupSeparators: function () {
            document.querySelectorAll('separator').forEach(sep => Roto2ToolsUtils.eliminarAdyacentes(sep));
        },
        applyFinalStyles: function () {
            const h = document.getElementById('header');
            if (h) { h.style.maxWidth = 'unset'; h.style.width = '100%'; }
            const m = document.querySelector('main');
            if (m) { m.style.margin = '0'; m.style.width = '100%'; m.style.maxWidth = 'unset'; m.style.gridTemplateColumns = '1fr auto'; }
        }
    };
    function init() {
        if (document.getElementById('fc-mobile-version-tag-for-monitoring') || document.querySelector('.mobiletitlebottom')) {
            Roto2ToolsUtils.showToast('warning', 'No funciona en la versión móvil.', 'Roto2Tools'); return;
        }
        if (Array.from(document.querySelectorAll('a')).find(a => a.textContent.trim() === 'Nuevo diseño')) {
            Roto2ToolsUtils.showToast('info', 'No funciona en el foro clásico.', 'Roto2Tools'); return;
        }
        if (Array.from(document.querySelectorAll('strong')).find(s => s.textContent.trim() === 'ForoCoches Smilies')) return;
        if (!document.querySelector('#user-online-status')) {
            Roto2ToolsUtils.showToast('error', 'No funciona si no estás logueado.', 'Roto2Tools'); return;
        }
        trackHistory();
        try {
            GM_addStyle(GM_getResourceText('bootstrapcss'));
            GM_addStyle(GM_getResourceText('toastrcss'));
            GM_addStyle(GM_getResourceText('Roto2Toolscss'));
        } catch (e) { console.error('Roto2Tools: Error al cargar CSS.', e); }
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const fa = document.createElement('link');
            fa.rel = 'stylesheet';
            fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css';
            document.head.appendChild(fa);
        }
        const scriptVersion = (typeof GM_info !== 'undefined') ? GM_info.script.version : '';
        let resaltarHilos = GM_getValue('resaltarHilos', []);
        let resaltarContactos = GM_getValue('resaltarContactos', []);
        let ocultarHilos = GM_getValue('ocultarHilos', []);
        let ocultarContactos = GM_getValue('ocultarContactos', []);
        try {
            Roto2ToolsMenu.create({
                initialResaltarHilos: resaltarHilos,
                initialOcultarHilos: ocultarHilos,
                initialResaltarContactos: resaltarContactos,
                initialOcultarContactos: ocultarContactos,
                scriptVersion,
                onSave: function (newData) {
                    GM_setValue('resaltarHilos', newData.resaltarHilos);
                    GM_setValue('ocultarHilos', newData.ocultarHilos);
                    GM_setValue('resaltarContactos', newData.resaltarContactos);
                    GM_setValue('ocultarContactos', newData.ocultarContactos);
                }
            });
        } catch (e) { console.error('Roto2Tools: Error al crear el menú.', e); }
        injectFavoriteButtonInThread();
        const processingOptions = { ocultarHilos, resaltarHilos, ocultarContactos, resaltarContactos };
        try {
            Roto2ToolsProcessing.processThreads(processingOptions);
            Roto2ToolsProcessing.processMessages(processingOptions);
            Roto2ToolsProcessing.cleanupSeparators();
            Roto2ToolsProcessing.applyFinalStyles();
        } catch (e) {
            console.error('Roto2Tools: Error en procesamiento.', e);
            Roto2ToolsUtils.showToast('error', 'Error al procesar. Revisa la consola.', 'Roto2Tools');
        }
    }
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        init();
    } else {
        window.addEventListener('DOMContentLoaded', init);
    }
})();