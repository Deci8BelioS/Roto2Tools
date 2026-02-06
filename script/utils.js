// ==UserScript==
// @name         Roto2Tools Utilities
// @namespace    Roto2Tools
// @version      1.0
// @description  Helper functions for Roto2Tools
// @author       DeciBelioS
// @grant        none
// ==/UserScript==

(function(window, $) {
    'use strict';
    if (!$) { console.error("Roto2Tools Utils: jQuery no está disponible."); return; }
    window.Roto2ToolsUtils = {
        getRegex: function(userInput, isRegex, wholeWords) {
            var regexString;
            if (isRegex) {
                return new RegExp(userInput, "i");
            } else {
                let escapedInput = userInput.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
                escapedInput = escapedInput.replace(/[aáà]/gi, "[aáà]").replace(/[eéè]/gi, "[eéè]").replace(/[iíï]/gi, "[iíï]").replace(/[oóò]/gi, "[oóò]").replace(/[uúü]/gi, "[uúü]").replace(/[\ ]*[\,]+[\ ]*$/, "").replace(/[\ ]*[\,]+[\ ]*/g, "|");
                let corePattern = `(${escapedInput})`;
                if (typeof wholeWords === "undefined" || wholeWords) { regexString = `(?<!\\w)${corePattern}(?!\\w)`; } else { regexString = corePattern; }
                try {
                    return new RegExp(regexString, "i");
                } catch (e) {
                    console.error(`Error creating RegExp: /${regexString}/i`, e);
                    return new RegExp('(?!)');
                }
            }
        },
        applyButtonInteractionEffects: function($button) {
            if (!$button || $button.length === 0) return;
            $button.on("mousedown", function () {$(this).css({ boxShadow: "none", transform: "translateY(3px)" });}).on("mouseup", function () {$(this).css({ boxShadow: "0px 2px 4px #000000", transform: "none" });});
        },
        getRegexcontacto: function(userInputcontacto, wholeWordscontacto) {
            const names = userInputcontacto.split(',').map(name => name.trim()).filter(name => name.length > 0);
            if (names.length === 0) { return new RegExp('(?!)'); }
            const escapedNames = names.map(name => { let escaped = name.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"); escaped = escaped.replace(/[aáà]/gi, "[aáà]").replace(/[eéè]/gi, "[eéè]").replace(/[iíï]/gi, "[iíï]").replace(/[oóò]/gi, "[oóò]").replace(/[uúü]/gi, "[uúü]"); return escaped; });
            let regexStringcontacto = escapedNames.join('|');
            if (wholeWordscontacto) { regexStringcontacto = `\\b(${regexStringcontacto})\\b`; }
            return new RegExp(regexStringcontacto, "i");
        },
        eliminarAdyacentes: function(hr) {
            let nextHr = hr.nextElementSibling;
            if (nextHr && nextHr.tagName === "SEPARATOR" && hr.getBoundingClientRect().bottom === nextHr.getBoundingClientRect().top) { nextHr.remove();
                if (hr.nextElementSibling) {this.eliminarAdyacentes(hr);}
            }
        },
        fetchOnlineList: function(type) {
            return new Promise((resolve, reject) => {
                const url = type === 'buddy' ? '/foro/profile.php?do=buddylist&nojs=1' : '/foro/profile.php?do=ignorelist&nojs=1';
                $.get(url)
                    .done(function(data) {
                        try {
                            const doc = new DOMParser().parseFromString(data, "text/html");
                            let anchors = [];
                            if (type === 'buddy') {
                                anchors = doc.querySelectorAll('div[id^="buddylist_user"] a[href*="member.php"]');
                            } else {
                                anchors = doc.querySelectorAll('#ignorelist li a[href*="member.php"]');
                            }
                            const users = Array.from(anchors)
                                .map(a => a.textContent.trim())
                                .filter(Boolean);
                            resolve(users);
                        } catch (e) { reject(e); }
                    })
                    .fail((err) => reject(err));
            });
        }
    };
})(window, window.jQuery);