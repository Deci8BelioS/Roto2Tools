// ============================================================
// ui.dropdowns.js — Roto2Tools
// ============================================================

// ── Historial & Favoritos ────────────────────────────────────
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
// ── Notas & Copypastas ───────────────────────────────────────
function createNotesDropdown(anchorEl) {
    const dropdown = document.createElement('div');
    dropdown.id = 'rt2-notes-dropdown';
    document.body.appendChild(dropdown);
    dropdown.addEventListener('click', e => e.stopPropagation());
    const getNotes = () => GM_getValue('rt2_notes', []);
    const setNotes = n => GM_setValue('rt2_notes', n);
    function positionDropdown() {
        const rect = anchorEl.getBoundingClientRect();
        dropdown.style.top = `${rect.bottom + window.scrollY + 6}px`;
        dropdown.style.left = `${Math.max(4, rect.right + window.scrollX - dropdown.offsetWidth)}px`;
    }
    let editingIndex = null;
    function showList() {
        dropdown.innerHTML = '';
        const header = document.createElement('div');
        header.className = 'rt2-nd-header';
        const title = document.createElement('span');
        title.className = 'rt2-nd-title';
        title.innerHTML = '<i class="fa-solid fa-note-sticky"></i> Notas';
        const addBtn = document.createElement('button');
        addBtn.className = 'rt2-nd-add-btn';
        addBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Nueva';
        addBtn.addEventListener('click', () => showEditor(null));
        header.append(title, addBtn);
        dropdown.appendChild(header);
        const notes = getNotes();
        if (notes.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'rt2-dd-empty';
            empty.innerHTML = '<i class="fa-solid fa-note-sticky"></i> No hay notas todavía.';
            dropdown.appendChild(empty);
        } else {
            const list = document.createElement('div');
            list.className = 'rt2-nd-list';
            notes.forEach((note, idx) => {
                const item = document.createElement('div');
                item.className = 'rt2-nd-item';
                const itemInfo = document.createElement('div');
                itemInfo.className = 'rt2-nd-item-info';
                const itemTitle = document.createElement('span');
                itemTitle.className = 'rt2-nd-item-title';
                itemTitle.textContent = note.title || 'Sin título';
                const itemPreview = document.createElement('span');
                itemPreview.className = 'rt2-nd-item-preview';
                itemPreview.textContent = note.content || '';
                itemInfo.append(itemTitle, itemPreview);
                const btns = document.createElement('div');
                btns.className = 'rt2-nd-item-btns';
                const copyBtn = document.createElement('button');
                copyBtn.className = 'rt2-nd-btn rt2-nd-btn-copy';
                copyBtn.title = 'Copiar al portapapeles';
                copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i>';
                copyBtn.addEventListener('click', () => {
                    const fallback = () => {
                        const ta = document.createElement('textarea');
                        ta.value = note.content;
                        ta.style.cssText = 'position:fixed;opacity:0';
                        document.body.appendChild(ta);
                        ta.select();
                        document.execCommand('copy');
                        document.body.removeChild(ta);
                    };
                    try { navigator.clipboard.writeText(note.content).catch(fallback); } catch { fallback(); }
                    copyBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
                    setTimeout(() => { copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i>'; }, 1500);
                    Roto2ToolsUtils.showToast('success', `"${note.title || 'Nota'}" copiada.`, 'Roto2Tools');
                });
                const editBtn = document.createElement('button');
                editBtn.className = 'rt2-nd-btn rt2-nd-btn-edit';
                editBtn.title = 'Editar';
                editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
                editBtn.addEventListener('click', () => showEditor(idx));
                const delBtn = document.createElement('button');
                delBtn.className = 'rt2-nd-btn rt2-nd-btn-del';
                delBtn.title = 'Eliminar';
                delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
                delBtn.addEventListener('click', () => {
                    if (confirm(`¿Eliminar "${note.title || 'Sin título'}"?`)) {
                        const n = getNotes(); n.splice(idx, 1); setNotes(n);
                        Roto2ToolsUtils.showToast('info', 'Nota eliminada.', 'Roto2Tools');
                        showList();
                    }
                });
                btns.append(copyBtn, editBtn, delBtn);
                item.append(itemInfo, btns);
                list.appendChild(item);
            });
            dropdown.appendChild(list);
        }
        requestAnimationFrame(positionDropdown);
    }
    function showEditor(idx) {
        editingIndex = idx;
        const note = idx !== null ? getNotes()[idx] : null;
        dropdown.innerHTML = '';
        const header = document.createElement('div');
        header.className = 'rt2-nd-header';
        const backBtn = document.createElement('button');
        backBtn.className = 'rt2-nd-back-btn';
        backBtn.innerHTML = '<i class="fa-solid fa-arrow-left"></i>';
        backBtn.title = 'Volver';
        backBtn.addEventListener('click', showList);
        const title = document.createElement('span');
        title.className = 'rt2-nd-title';
        title.textContent = idx !== null ? 'Editar nota' : 'Nueva nota';
        header.append(backBtn, title);
        dropdown.appendChild(header);
        const body = document.createElement('div');
        body.className = 'rt2-nd-editor';
        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.className = 'rt2-nd-input';
        titleInput.placeholder = 'Título...';
        titleInput.value = note?.title || '';
        const contentTextarea = document.createElement('textarea');
        contentTextarea.className = 'rt2-nd-textarea';
        contentTextarea.placeholder = 'Contenido, copypasta, meme...';
        contentTextarea.rows = 5;
        contentTextarea.value = note?.content || '';
        const saveBtn = document.createElement('button');
        saveBtn.className = 'rt2-button rt2-button-save';
        saveBtn.style.cssText = 'width:100%;justify-content:center;margin-top:4px';
        saveBtn.innerHTML = '<i class="fa-solid fa-save"></i> Guardar';
        saveBtn.addEventListener('click', () => {
            const content = contentTextarea.value.trim();
            if (!content) { Roto2ToolsUtils.showToast('error', 'El contenido no puede estar vacío.', 'Roto2Tools'); return; }
            const notes = getNotes();
            const noteData = { title: titleInput.value.trim() || 'Sin título', content, date: new Date().toLocaleString() };
            if (editingIndex !== null) { notes[editingIndex] = noteData; } else { notes.unshift(noteData); }
            setNotes(notes);
            Roto2ToolsUtils.showToast('success', 'Nota guardada.', 'Roto2Tools');
            showList();
        });
        body.append(titleInput, contentTextarea, saveBtn);
        dropdown.appendChild(body);
        requestAnimationFrame(positionDropdown);
        titleInput.focus();
    }
    anchorEl.addEventListener('click', e => {
        e.stopPropagation();
        if (dropdown.classList.contains('visible')) {
            dropdown.classList.remove('visible');
        } else {
            showList();
            dropdown.classList.add('visible');
            positionDropdown();
        }
    });
    document.addEventListener('click', () => dropdown.classList.remove('visible'));
    window.addEventListener('resize', () => { if (dropdown.classList.contains('visible')) positionDropdown(); });
    window.addEventListener('scroll', () => { if (dropdown.classList.contains('visible')) positionDropdown(); }, true);
}
