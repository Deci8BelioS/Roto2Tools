// ==UserScript==
// @name         Roto2Tools Processing Logic
// @namespace    Roto2Tools
// @version      1.0
// @description  Handles hiding/highlighting threads and messages
// @author       DeciBelioS
// @grant        none
// ==/UserScript==

(function(window, $, tippy, Utils) {
    'use strict';
    if (!$) { console.error("Roto2Tools Processing: jQuery no está disponible."); return; }
    if (!tippy) { console.error("Roto2Tools Processing: Tippy no está disponible."); return; }
    if (!Utils) { console.error("Roto2Tools Processing: Roto2ToolsUtils no está disponible."); return; }
    window.Roto2ToolsProcessing = {
        processThreads: function(options) {
            const { ocultarHilos, resaltarHilos, ocultarContactos, resaltarContactos } = options;
            const elementos = document.querySelectorAll("section.without-bottom-corners > div");
            const elementosOcultos = [];
            const threadContainer = document.querySelector("main>div>section");
            elementos.forEach((el) => {
                const tituloSpan = el.querySelector('[id*="thread_title_"]>span');
                if (!tituloSpan) return;
                const titleLink = Array.from(el.querySelectorAll('a')).find(a => a.innerText.trim().startsWith('@'));
                const textTitle = titleLink ? titleLink.innerText.toLowerCase() : "";
                const textoTituloSpan = tituloSpan.innerText.toLowerCase();
                let originalTituloHtml = tituloSpan.innerHTML;
                let applyHideContactStyle = false;
                let applyHighlightContactStyle = false;
                let applyHideThreadStyle = false;
                let applyHighlightThreadStyle = false;
                let mustBeHidden = false;
                let applyBaseStyles = false;
                if (ocultarContactos.some(palabra => Utils.getRegex(palabra, false, true).test(textTitle))) {
                    applyHideContactStyle = true;
                    mustBeHidden = true;
                    applyBaseStyles = true;
                }
                if (resaltarContactos.some(palabra => Utils.getRegex(palabra, false, true).test(textTitle))) {
                    applyHighlightContactStyle = true;
                    applyBaseStyles = true;
                }
                const matchedHideKeywords = ocultarHilos.filter(palabra => Utils.getRegex(palabra, false, true).test(textoTituloSpan));
                if (matchedHideKeywords.length > 0) {
                    applyHideThreadStyle = true;
                    mustBeHidden = true;
                    applyBaseStyles = true;
                }
                const matchedHighlightKeywords = resaltarHilos.filter(palabra => Utils.getRegex(palabra, false, true).test(textoTituloSpan));
                if (matchedHighlightKeywords.length > 0) {
                    applyHighlightThreadStyle = true;
                    applyBaseStyles = true;
                }
                let modifiedTitleHtml = originalTituloHtml;
                if (applyHideContactStyle) {
                    el.style.cssText = "background: #541818; text-shadow: 0px 2px 4px #000; border-radius: 5px; box-shadow: 0 2px 4px #000000;; border: 1px solid #c9c9c935;";
                } else if (applyHighlightContactStyle) {
                    el.style.cssText = "background: #003A00; text-shadow: 0px 2px 4px #000;";
                    el.style.borderRadius = "5px";
                } else if (applyHideThreadStyle) {
                    el.style.cssText = "background: #3D3D3D; text-shadow: 0px 2px 4px #000; border-radius: 5px; box-shadow: 0 2px 4px #000000;; border: 1px solid #c9c9c935;";
                } else if (applyHighlightThreadStyle) {
                    el.style.cssText = "background: #3D3D3D; font-weight: bold; text-shadow: 0px 2px 4px #000;";
                }
                if (applyBaseStyles) {
                    tituloSpan.style.color = "#ffffff";
                }
                if (applyHideContactStyle || applyHighlightContactStyle) {
                    const index = textTitle.indexOf("@");
                    if (index !== -1 && titleLink && titleLink.parentNode) {
                        const endIndex = textTitle.indexOf("-", index);
                        const nick = textTitle.substring(index, endIndex !== -1 ? endIndex : undefined).trim();
                        const resto = textTitle.substring(textTitle.indexOf("-", index) + 1).trim();
                        const newSpan = document.createElement("span");
                        let nickColor = applyHideContactStyle ? "#FF2626" : "#2FC726";
                        newSpan.innerHTML = `<span style="color: ${nickColor}; font-weight: bold; font-size: 0.75rem; text-shadow: 0px 2px 4px #000;">${nick}</span> <span style="color: var(--gray-text); font-size: 0.75rem;">${resto}</span>`;
                        titleLink.parentNode.insertBefore(newSpan, titleLink);
                        titleLink.remove();
                    }
                }
                if (applyHighlightThreadStyle) {
                    matchedHighlightKeywords.forEach(palabra => {
                        const regex = Utils.getRegex(palabra, false, true);
                        const regexTitulo = new RegExp(regex.source, "ig");
                        modifiedTitleHtml = modifiedTitleHtml.replace(regexTitulo, (match) => `<span style="font-weight: bold; color: #EDD40E;">${match}</span>`);
                    });
                }
                if (applyHideThreadStyle) {
                    matchedHideKeywords.forEach(palabra => {
                        const regex = Utils.getRegex(palabra, false, true);
                        const regexTitulo = new RegExp(regex.source, "ig");
                        modifiedTitleHtml = modifiedTitleHtml.replace(regexTitulo, (match) => `<span style="font-weight: bold; color: #FD5D4D;">${match}</span>`);
                    });
                }
                if (applyHighlightThreadStyle || applyHideThreadStyle) {
                    tituloSpan.innerHTML = modifiedTitleHtml;
                }
                if (mustBeHidden) {
                    elementosOcultos.push(el);
                }
            });
            elementosOcultos.forEach(el => {
                if (el.parentNode) {
                    el.remove();
                }
            });
            if (elementosOcultos.length > 0 && threadContainer) {
                const contenedorOcultos = document.createElement("div");
                contenedorOcultos.style.cssText = "max-height: 0px; overflow: hidden; margin-top: 5px; transition: max-height 0.2s ease-out;";
                elementosOcultos.forEach((elemento) => {
                    elemento.style.margin = "5px 0";
                    contenedorOcultos.appendChild(elemento);
                });
                const cantidadHilosOcultos = elementosOcultos.length;
                const spoilerBtn = document.createElement("div");
                spoilerBtn.style.cssText = "background: #3A3A3A; color: #ffff; border: 1px solid #c9c9c935; font-weight: bold; text-shadow: 0px 2px 4px #000; text-align: center; box-shadow: 0px 2px 4px #000; padding: 10px; border-radius: 5px; cursor: pointer; transition: transform 0.3s, box-shadow 0.3s, background-color 0.3s;";
                spoilerBtn.textContent = `${cantidadHilosOcultos} Hilo(s) oculto(s)`;
                Utils.applyButtonInteractionEffects($(spoilerBtn));
                tippy(spoilerBtn, { content: "Haz clic para mostrar/ocultar los hilos", animation: "scale", interactive: true, placement: "bottom", arrow: true });
                spoilerBtn.addEventListener("click", () => {
                    const isHidden = contenedorOcultos.style.maxHeight === "0px";
                    spoilerBtn.textContent = isHidden ? `${cantidadHilosOcultos} Hilo(s) mostrando` : `${cantidadHilosOcultos} Hilo(s) oculto(s)`;
                    contenedorOcultos.style.maxHeight = isHidden ? `${contenedorOcultos.scrollHeight}px` : "0px";
                    if (isHidden) {
                        spoilerBtn.style.backgroundColor = "#4a4a4a";
                    } else {
                        spoilerBtn.style.backgroundColor = "#3A3A3A";
                    }
                });
                window.addEventListener('resize', () => {
                    if (contenedorOcultos.style.maxHeight !== "0px") {
                        if(contenedorOcultos && contenedorOcultos.scrollHeight) {
                            contenedorOcultos.style.maxHeight = `${contenedorOcultos.scrollHeight}px`;
                        }
                    }
                });
                threadContainer.appendChild(contenedorOcultos);
                threadContainer.appendChild(spoilerBtn);
            }
        },
        processMessages: function(options) {
            const { ocultarContactos, resaltarContactos } = options;
            const userHighlightStyle = document.createElement("style");
            userHighlightStyle.innerHTML = `[id*="edit"] > section.resaltado { border-left: solid 4px #2fc726 !important; }`;
            document.head.appendChild(userHighlightStyle);
            if (resaltarContactos.length > 0) {
                const regexResaltarUnion = Utils.getRegexcontacto(resaltarContactos.join(','), true);
                document.querySelectorAll(`[id*="postmenu_"] h2:not(.resaltado)`).forEach((editcontacto) => {
                    const elemAmi = Array.from(editcontacto.querySelectorAll('a')).find(a => a.innerText.trim() !== "");
                    if (elemAmi && !elemAmi.classList.contains('resaltado') && regexResaltarUnion.test(elemAmi.innerText.toLowerCase())) {
                        elemAmi.classList.add('resaltado');
                        const sectioncontacto = editcontacto.querySelector("section");
                        if (sectioncontacto) sectioncontacto.classList.add("resaltado");
                    }
                });
            }
            if (ocultarContactos.length > 0) {
                const regexOcultarUnion = Utils.getRegexcontacto(ocultarContactos.join(','), true);
                document.querySelectorAll(`[id*="edit"]:not(.oculto)`).forEach((editcontacto) => {
                    const postmenuElem = Array.from(editcontacto.querySelectorAll('a')).find(a => a.innerText.trim() !== "");
                    if (postmenuElem && regexOcultarUnion.test(postmenuElem.innerText.toLowerCase())) {
                        const sectioncontacto = editcontacto.querySelector("section");
                        if (sectioncontacto && !sectioncontacto.classList.contains('oculto')) {
                            sectioncontacto.classList.add("oculto");
                            editcontacto.classList.add("oculto");
                            const spoiler = document.createElement("details");
                            spoiler.classList.add("spoiler");
                            spoiler.style.cssText = "background: #2A2A2A; border-radius: 5px; margin-bottom: 12px; box-shadow: 0 2px 4px #000000; padding: 5px; transition: transform 0.3s, box-shadow 0.3s";
                            const botonSpoiler = document.createElement("summary");
                            botonSpoiler.innerText = "El mensaje de este usuario esta oculto por que está en la lista de Ocultar Usuarios";
                            botonSpoiler.style.cssText = "background: #3D3D3D; text-align: center; text-shadow: 0px 2px 4px #000; box-shadow: 0 2px 4px #000000; cursor: pointer; color: #ffff; font-weight: bold; transition: transform 0.3s, box-shadow 0.3s";
                            editcontacto.before(spoiler);
                            spoiler.appendChild(botonSpoiler);
                            spoiler.appendChild(editcontacto);
                            Utils.applyButtonInteractionEffects($(spoiler));
                            tippy(spoiler, { content: "Haz clic para mostrar/ocultar el mensaje", animation: "scale", interactive: true, placement: "bottom", arrow: true });
                            const separatorLargeElement = editcontacto.querySelector("separator-large");
                            if (separatorLargeElement) separatorLargeElement.remove();
                        }
                    }
                });
                document.querySelectorAll('.quote').forEach((quoteElem) => {
                    const boldAuthor = quoteElem.querySelector('div > div:first-child b');
                    if (boldAuthor && !quoteElem.classList.contains('processed-quote')) {
                        const authorName = boldAuthor.innerText.trim();
                        if (regexOcultarUnion.test(authorName)) {
                            quoteElem.classList.add('processed-quote');
                            quoteElem.innerHTML = `
                                <div style="padding: 8px; background: rgba(50, 20, 20, 0.4); border: 1px solid rgba(255, 80, 80, 0.2); border-radius: 6px; color: #aaa; font-size: 0.85rem; display: flex; align-items: center; gap: 8px;">
                                    <i class="fa-solid fa-user-slash" style="color: #ff5845;"></i>
                                    <span>Cita de <strong>${authorName}</strong> oculta por filtro de usuario.</span>
                                </div>
                            `;
                        }
                    }
                });
            }
        },
        cleanupSeparators: function() {
            let hrElements = document.querySelectorAll("separator");
            for (let i = 0; i < hrElements.length; i++) {
                const currentHr = document.querySelectorAll("separator")[i];
                if (currentHr) {
                    Utils.eliminarAdyacentes(currentHr);
                }
            }
        },
        applyFinalStyles: function() {
            $("#header").css({ "max-width": "unset", margin: "unset", width: "100%" });
            $("main").css({ margin: "0", width: "100%", "max-width": "unset", "grid-template-columns": "1fr auto" });
        }
    };
})(window, window.jQuery, window.tippy, window.Roto2ToolsUtils);