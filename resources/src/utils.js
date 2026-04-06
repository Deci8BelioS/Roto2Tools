// ============================================================
// utils.js — Roto2Tools
// ============================================================
function applyAccentGroups(str) {
    return str
        .replace(/[aáà]/gi, '[aáà]')
        .replace(/[eéè]/gi, '[eéè]')
        .replace(/[iíï]/gi, '[iíï]')
        .replace(/[oóò]/gi, '[oóò]')
        .replace(/[uúü]/gi, '[uúü]');
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
