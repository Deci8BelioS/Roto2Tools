// ============================================================
// processing.js — Roto2Tools
// ============================================================
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
                    modifiedHtml = modifiedHtml.replace(r, m => `<span style="font-weight:bold;color:${color};">${m}</span>`);
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
            elementosOcultos.forEach(el => { el.classList.add('rt2-hidden-thread-item'); hiddenContainer.appendChild(el); });
            const spoilerBtn = document.createElement('div');
            spoilerBtn.className = 'rt2-spoiler-btn';
            spoilerBtn.textContent = `${elementosOcultos.length} Hilo(s) oculto(s)`;
            Roto2ToolsUtils.applyTooltip(spoilerBtn, 'Haz clic para mostrar/ocultar los hilos');
            Roto2ToolsUtils.applyButtonInteractionEffects(spoilerBtn);
            spoilerBtn.addEventListener('click', () => {
                const isHidden = hiddenContainer.style.maxHeight === '0px';
                spoilerBtn.textContent = isHidden
                    ? `${elementosOcultos.length} Hilo(s) mostrando`
                    : `${elementosOcultos.length} Hilo(s) oculto(s)`;
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
                if (editEl.parentNode) { editEl.parentNode.insertBefore(spoiler, editEl); spoiler.append(summary, editEl); }
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
        document.querySelectorAll('separator').forEach(sep => Roto2ToolsUtils.eliminarAdyacentes(sep));
    },
    applyFinalStyles() {
        if (settings.expandirLayout) {
            const header = document.getElementById('header');
            if (header) { header.style.maxWidth = 'unset'; header.style.width = '100%'; }
            const main = document.querySelector('main');
            if (main) {
                main.style.margin = '0'; main.style.width = '100%'; main.style.maxWidth = 'unset';
                main.style.gridTemplateColumns = settings.ocultarIdSidebar ? '1fr' : '1fr auto';
            }
        }
        if (settings.ocultarIdSidebar) {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) sidebar.style.display = 'none';
            const main = document.querySelector('main');
            if (main) main.style.gridTemplateColumns = '1fr';
        }
    },
};
