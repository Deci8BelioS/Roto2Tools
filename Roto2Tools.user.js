// ==UserScript==
// @id              Roto2Tools
// @name            Roto2Tools
// @namespace       Roto2Tools
// @author          DeciBelioS
// @homepage        https://github.com/Deci8BelioS/Roto2Tools/
// @description     Script para Forocoches que oculta hilos o los resalta con las palabras añadidas por el usuario
// @icon            https://raw.githubusercontent.com/Deci8BelioS/Roto2Tools/main/resources/img/icon-48x48.png
// @icon64          https://raw.githubusercontent.com/Deci8BelioS/Roto2Tools/main/resources/img/icon-64x64.png
// @updateURL       https://raw.githubusercontent.com/Deci8BelioS/Roto2Tools/main/Roto2Tools.user.js
// @version         1.3.6b
// @encoding        UTF-8
// @include         http://www.forocoches.com/*
// @include         http://forocoches.com/*
// @include         https://www.forocoches.com/*
// @include         https://forocoches.com/*
// @grant           GM_setValue
// @grant           GM_getValue
// @grant           GM_deleteValue
// @grant           GM_xmlhttpRequest
// @grant           GM_addStyle
// @grant           GM_getResourceText
// @grant           GM_getResourceURL
// @grant           GM_getMetadata
// @run-at          document-end
// @require         https://code.jquery.com/jquery-3.6.4.min.js
// @require         https://raw.githubusercontent.com/Deci8BelioS/Roto2Tools/main/resources/require/toastr.js
// @require         https://unpkg.com/@popperjs/core@2
// @require         https://unpkg.com/tippy.js@6
// @resource        toastrcss  https://raw.githubusercontent.com/Deci8BelioS/Roto2Tools/main/resources/require/toastr.min.css
// @resource        tippycss https://unpkg.com/tippy.js@6/dist/tippy.css
// @resource        scalecss https://unpkg.com/tippy.js@6/animations/scale.css
// ==/UserScript==

// Seleccionar el elemento "header"
const header = $("#header");

// Cargar y agregar el archivo CSS de toastr como recurso y estilo en la página
const toastrcss = GM_getResourceText('toastrcss');
GM_addStyle(toastrcss);

const tippycss = GM_getResourceText('tippycss');
GM_addStyle(tippycss);

const scalecss = GM_getResourceText('scalecss');
GM_addStyle(scalecss);

toastr.options = { "closeButton": false, "debug": false, "newestOnTop": false, "progressBar": true, "positionClass": "toast-bottom-right", "preventDuplicates": true, "onclick": null, "showDuration": "350", "hideDuration": "1000", "timeOut": "6000", "extendedTimeOut": "2000", "showEasing": "swing", "hideEasing": "linear", "showMethod": "fadeIn", "hideMethod": "fadeOut" };

// Si estas en modo telefno, en el foro clasico o no estas logeado no funciona el script
let telefono = $("#fc-mobile-version-tag-for-monitoring");
let telefonoClasico = $(".mobiletitlebottom");
let clasico = $("a:contains('Nuevo diseño')");
let listaIconosFC = $("strong:contains('ForoCoches Smilies')");
let noShur = $("#user-online-status");

// Si estas logeado y en el pc (o modo escritorio) se ejecuta el script
if (telefono.length || telefonoClasico.length) {
    toastr["warning"](`No funciona en telefonos &nbsp;<img src="https://forocoches.com/foro/images/smilies/smash2.gif"></a>`, `Roto2Tools`);
} else if (clasico.length) {
    toastr["info"](`No funciona en el foro clasico<img src="https://forocoches.com/foro/images/smilies/eaea.gif"></a>`, `Roto2Tools`);
} else if (listaIconosFC.length) {
    return;
} else if (!noShur.length) {
    toastr["error"](`No funciona si no estas logeado`, `Roto2Tools &nbsp;<img src="https://forocoches.com/foro/images/smilies/nono.gif"></a>`);
} else {

    // leer la lista guardada en Tampermonkey
    let resaltarHilos = GM_getValue("resaltarHilos", []);
    let resaltarContactos = GM_getValue("resaltarContactos", []);
    let ocultarHilos = GM_getValue("ocultarHilos", []);
    let ocultarContactos = GM_getValue("ocultarContactos", []);

    // Función para escapar caracteres, quitar comas etc etc
    function getRegex(userInput, isRegex, wholeWords) {
        var regex;
        if (isRegex) {
            regex = new RegExp(userInput, "i");
        } else {
            userInput = userInput.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"); //Escapar caracteres reservador de las regex
            userInput = userInput.replace(/[\ ]*[\,]+[\ ]*$/, ""); //Quitar comas sobrantes
            if (typeof wholeWords == "undefined" || wholeWords) {
                regex = "(\\b|\\ )"; //word-break
            } else {
                regex = "";
            }

            regex += "(" + userInput
                .replace(/[aáà]/ig, "[aáà]")
                .replace(/[eéè]/ig, "[eéè]")
                .replace(/[iíï]/ig, "[iíï]") //Accents insensitive
                .replace(/[oóò]/ig, "[oóò]")
                .replace(/[uúü]/ig, "[uúü]")
                .replace(/[\ ]*[\,]+[\ ]*/g, "|") + ")"; //Reemplazar las comas por |

            if (typeof wholeWords == "undefined" || wholeWords) {
                regex += "(\\b|\\ )"; //word-break
            }

            regex = new RegExp(regex, "i");
        }

        return regex;
    };

    // Crear un contenedor para los botones
    const buttonContainer = $("<div>")
        .css({ display: "flex", "justify-content": "flex-end", "align-items": "center", "margin-right": "20px" })

    // Creamos el botón menú de Roto2Tools
    const menuBtn = $("<button>").text("Roto2Tools")
        .css({ "background-color": "#FF5A4B", color: "white", padding: "10px 20px", "font-weight": "bold", "text-shadow": "1px 1px 4px #000", "border-radius": "6px", cursor: "pointer", "margin-left": "5px", "box-shadow": "0px 2px 4px rgba(0, 0, 0, 0.6)", transition: "transform 0.3s, box-shadow 0.3s" })
        .on("mousedown", function () { $(this).css({ boxShadow: "none", transform: "translateY(3px)" }); })
        .on("mouseup", function () { $(this).css({ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.6)", transform: "none" }); });
    buttonContainer.append(menuBtn[0]);

    // Inicializamos Tippy.js con el gatillo
    tippy(menuBtn[0], {
        content: 'Haz clic para abrir las preferencias',
        animation: 'scale',
        interactive: true,
        placement: 'bottom', // La ubicación donde se mostrará Tippy
        arrow: true, // Mostrar una flecha en Tippy
    });

    // Buscar el elemento "#searchform-desktop"
    const Roto2Tools = $("#searchform-desktop");

    // Insertar el contenedor de botones después del elemento "#searchform-desktop" si existe, de lo contrario no lo hará
    if (Roto2Tools.length > 0) {
        Roto2Tools.after(buttonContainer);
    }

    // crear una variable global para controlar el estados
    let ventanaAbierta = false;
    let botonPulsado = false;
    let hasGuardado = false;

    // escuchar eventos de clic en el botón de menu
    menuBtn.on("click", function () {
        // Verificar si el botón ha sido pulsado previamente
        if (ventanaAbierta) {
            toastr["error"](`Ya tienes el menú abierto ¿Por que quieres abrirlo otra vez? &nbsp;<img src="https://forocoches.com/foro/images/smilies/goofy.gif"></a>`, `Roto2Tools`);
            return;
        }
        // verificar si hay una ventana emergente abierta
        if (!ventanaAbierta) {
            // establecer el estado de la ventana emergente en abierto
            ventanaAbierta = true;

            // Deshabilitar el scroll al abrir el menú
            Object.assign(document.body.style, { overflow: "hidden", position: "fixed" });

            const nuevaVentana = $("<div></div>").addClass("nuevaVentana")
                .css({ transition: "width 1.5s ease-out, height 1.5s ease-out", position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", border: "5px solid #2A2A2A", borderRadius: "6px", boxShadow: "0 2px 6px rgba(0, 0, 0, 1)", backgroundColor: "#2A2A2A", zIndex: "9999", padding: "20px", textAlign: "center", opacity: "0" })
                .appendTo("body");

            // Esperar un breve momento para aplicar el efecto de entrada
            setTimeout(() => {
                nuevaVentana.animate({ opacity: "1" }, 300); // Duración de la animación y tipo de efecto
            }, 10);

            // Crear el título de la caja de resaltar hilos
            const resaltarHilosTitulo = $("<button>").text("Resaltar hilos")
                .css({ display: "block", padding: "5px", border: "5px solid rgb(58, 58, 58)", cursor: "pointer", color: "#EDD40E", "text-shadow": "rgb(0, 0, 0) 1px 1px 4px", margin: "0px auto 10px", width: "145px", "font-weight": "bold", "box-shadow": "rgba(0, 0, 0, 0.6) 0px 2px 6px", "border-radius": "6px", "background-color": "rgb(58, 58, 58)", transition: "transform 0.3s, box-shadow 0.3s" })
                .on("mousedown", function () { $(this).css({ boxShadow: "none", transform: "translateY(3px)" }); })
                .on("mouseup", function () { $(this).css({ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.6)", transform: "none" }); });
            nuevaVentana.append(resaltarHilosTitulo);

            // Crear textarea para agregar palabras a resaltar
            const ResaltarInput = $("<textarea>").attr("placeholder", "Agregar palabras a resaltar separadas por comas, ejemplo: palabra, palabra")
                .val(resaltarHilos.join(", "))
                .css({ display: "none", "background-color": "rgb(58, 58, 58)", color: "white", padding: "10px", "border-radius": "6px", "box-shadow": "rgba(0, 0, 0, 0.6) 0px 2px 4px", "text-shadow": "rgb(0, 0, 0) 1px 1px 4px", "font-weight": "bold", width: "320px", "min-width": "320px", "max-width": "320px", height: "80px", "min-height": "80px", "max-height": "320px" });
            nuevaVentana.append(ResaltarInput);

            // Agregar evento de click al título para desplegar textarea
            resaltarHilosTitulo.on("click", function () {
                ResaltarInput.fadeToggle(250);
            });
            // Inicializamos Tippy.js con el gatillo
            tippy(resaltarHilosTitulo[0], {
                content: 'Haz clic para mostrar/ocultar la lista',
                animation: 'scale',
                interactive: true,
                placement: 'left', // La ubicación donde se mostrará Tippy
                arrow: true, // Mostrar una flecha en Tippy
            });

            // Crear contenedor para el área de ocultar hilos
            const ocultarHilosContainer = $("<div>")
                .css({ display: "flex", "align-items": "center", "margin-bottom": "10px" })
            nuevaVentana.append(ocultarHilosContainer);

            // Crear el título de la caja de resaltar hilos
            const ocultarHilosTitulo = $("<button>").text("Ocultar hilos")
                .css({ display: "block", padding: "5px", border: "5px solid rgb(58, 58, 58)", cursor: "pointer", color: "#FD5D4D", "text-shadow": "rgb(0, 0, 0) 1px 1px 4px", margin: "0px auto 10px", width: "145px", "font-weight": "bold", "box-shadow": "rgba(0, 0, 0, 0.6) 0px 2px 6px", "border-radius": "6px", "background-color": "rgb(58, 58, 58)", transition: "transform 0.3s, box-shadow 0.3s" })
                .on("mousedown", function () { $(this).css({ boxShadow: "none", transform: "translateY(3px)" }); })
                .on("mouseup", function () { $(this).css({ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.6)", transform: "none" }); });
            nuevaVentana.append(ocultarHilosTitulo);

            // Crear textarea para agregar palabras a ocultar
            const ocultarInput = $("<textarea>").attr("placeholder", "Agregar palabras a ocultar separadas por comas, ejemplo: palabra, palabra")
                .val(ocultarHilos.join(", ")) // Agregar lista como valor inicial
                .css({ display: "none", "background-color": "rgb(58, 58, 58)", color: "white", padding: "10px", "border-radius": "6px", "box-shadow": "rgba(0, 0, 0, 0.6) 0px 2px 4px", "text-shadow": "rgb(0, 0, 0) 1px 1px 4px", "font-weight": "bold", width: "320px", "min-width": "320px", "max-width": "320px", height: "80px", "min-height": "80px", "max-height": "320px" });
            nuevaVentana.append(ocultarInput);

            // Agregar evento de click al título para desplegar textarea
            ocultarHilosTitulo.on("click", function () {
                ocultarInput.fadeToggle(250); // alternar la visibilidad del área de texto
            });

            // Inicializamos Tippy.js con el gatillo
            tippy(ocultarHilosTitulo[0], {
                content: 'Haz clic para mostrar/ocultar la lista',
                animation: 'scale',
                interactive: true,
                placement: 'left', // La ubicación donde se mostrará Tippy
                arrow: true, // Mostrar una flecha en Tippy
            });

            // Crear contenedor para el área de ocultar contactos Contactos
            const ocultarContactosContainer = $("<div>")
                .css({ display: "flex", "align-items": "center", "margin-bottom": "10px" })
            nuevaVentana.append(ocultarContactosContainer);

            // Crear el título de la caja de ocultar hilos
            const ocultarContactosTitulo = $("<button>").text("Ocultar hilos usuarios")
                .css({ display: "block", padding: "5px", border: "5px solid rgb(58, 58, 58)", cursor: "pointer", color: "#FF2626", "text-shadow": "rgb(0, 0, 0) 1px 1px 4px", margin: "0px auto 10px", width: "145px", "font-weight": "bold", "box-shadow": "rgba(0, 0, 0, 0.6) 0px 2px 6px", "border-radius": "6px", "background-color": "rgb(58, 58, 58)", transition: "transform 0.3s, box-shadow 0.3s" })
                .on("mousedown", function () { $(this).css({ boxShadow: "none", transform: "translateY(3px)" }); })
                .on("mouseup", function () { $(this).css({ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.6)", transform: "none" }); });
            nuevaVentana.append(ocultarContactosTitulo);

            // Crear textarea para agregar palabras a ocultar
            const ocultarContactosInput = $("<textarea>").attr("placeholder", "Agregar usuarios para ocultar sus hilos separados por comas (sin el @), ejemplo: Pepe palotes, iliti")
                .val(ocultarContactos.join(", "))
                .css({ display: "none", "background-color": "rgb(58, 58, 58)", color: "white", padding: "10px", "border-radius": "6px", "box-shadow": "rgba(0, 0, 0, 0.6) 0px 2px 4px", "text-shadow": "rgb(0, 0, 0) 1px 1px 4px", "font-weight": "bold", width: "320px", "min-width": "320px", "max-width": "320px", height: "80px", "min-height": "80px", "max-height": "320px" });
            nuevaVentana.append(ocultarContactosInput);

            // Agregar evento de click al título para desplegar textarea
            ocultarContactosTitulo.on("click", function () {
                ocultarContactosInput.fadeToggle(250); // alternar la visibilidad del área de texto
            });

            // Inicializamos Tippy.js con el gatillo
            tippy(ocultarContactosTitulo[0], {
                content: 'Haz clic para mostrar/ocultar la lista',
                animation: 'scale',
                interactive: true,
                placement: 'left', // La ubicación donde se mostrará Tippy
                arrow: true, // Mostrar una flecha en Tippy
            });

            // Crear contenedor para el área de ocultar contactos Contactos
            const resaltarMensajesContactosContainer = $("<div>")
                .css({ display: "flex", "align-items": "center", "margin-bottom": "10px" })
            nuevaVentana.append(resaltarMensajesContactosContainer);

            // Crear el título de la caja de ocultar hilos
            const resaltarMensajesContactosTitulo = $("<button>").text("Resaltar mensajes usuarios")
                .css({ display: "block", padding: "5px", border: "5px solid rgb(58, 58, 58)", cursor: "pointer", color: "#2fc726", "text-shadow": "rgb(0, 0, 0) 1px 1px 4px", margin: "0px auto 10px", width: "145px", "font-weight": "bold", "box-shadow": "rgba(0, 0, 0, 0.6) 0px 2px 6px", "border-radius": "6px", "background-color": "rgb(58, 58, 58)", transition: "transform 0.3s, box-shadow 0.3s" })
                .on("mousedown", function () { $(this).css({ boxShadow: "none", transform: "translateY(3px)" }); })
                .on("mouseup", function () { $(this).css({ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.6)", transform: "none" }); });
            nuevaVentana.append(resaltarMensajesContactosTitulo);

            // Crear textarea para agregar palabras a ocultar
            const resaltarMensajesContactosInput = $("<textarea>").attr("placeholder", "Agregar usuarios para resaltar sus mensajes en los hilos ejemplo: Pepe palotes, iliti")
                .val(resaltarContactos.join(", "))
                .css({ display: "none", "background-color": "rgb(58, 58, 58)", color: "white", padding: "10px", "border-radius": "6px", "box-shadow": "rgba(0, 0, 0, 0.6) 0px 2px 4px", "text-shadow": "rgb(0, 0, 0) 1px 1px 4px", "font-weight": "bold", width: "320px", "min-width": "320px", "max-width": "320px", height: "80px", "min-height": "80px", "max-height": "320px" });
            nuevaVentana.append(resaltarMensajesContactosInput);

            // Agregar evento de click al título para desplegar textarea
            resaltarMensajesContactosTitulo.on("click", function () {
                resaltarMensajesContactosInput.fadeToggle(250); // alternar la visibilidad del área de texto
            });

            // Inicializamos Tippy.js con el gatillo
            tippy(resaltarMensajesContactosTitulo[0], {
                content: 'Haz clic para mostrar/ocultar la lista',
                animation: 'scale',
                interactive: true,
                placement: 'left', // La ubicación donde se mostrará Tippy
                arrow: true, // Mostrar una flecha en Tippy
            });

            // Crear el botón para guardar las listas
            const guardarlistasBtn = $("<button>").text("GUARDAR")
                .css({ display: "block", "background-color": "rgb(255, 90, 75)", color: "white", "font-weight": "bold", padding: "10px 20px", "border-radius": "6px", "text-shadow": "rgb(0, 0, 0) 1px 1px 4px", cursor: "pointer", "box-shadow": "rgba(0, 0, 0, 0.6) 0px 2px 4px", margin: "5px auto", "margin-top": "15px", transition: "transform 0.3s, box-shadow 0.3s" })
                .on("mousedown", function () { $(this).css({ boxShadow: "none", transform: "translateY(3px)" }); })
                .on("mouseup", function () { $(this).css({ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.6)", transform: "none" }); });
            guardarlistasBtn.on("click", function () {

                // Verificar si el botón ha sido pulsado previamente
                if (botonPulsado) {
                    toastr["error"](`No des tantos clics cowboy <img src="https://forocoches.com/foro/images/smilies/para.gif"></a>`, `Roto2Tools`);
                    return;
                }

                // Establecer variable a true para indicar que el botón ha sido pulsado
                botonPulsado = true;
                hasGuardado = true;

                const OcultarListaInput = $(ocultarInput).val().trim();
                const resaltarListaInput = $(ResaltarInput).val().trim();
                const ocultarContactosListaInput = $(ocultarContactosInput).val().trim();
                const resaltarMensajesContactostListaInput = $(resaltarMensajesContactosInput).val().trim();
                if (OcultarListaInput || resaltarListaInput || ocultarContactosListaInput || resaltarMensajesContactostListaInput) {

                    // Eliminar la lista anterior
                    GM_deleteValue("ocultarHilos");
                    GM_deleteValue("resaltarHilos");
                    GM_deleteValue("ocultarContactos");
                    GM_deleteValue("resaltarContactos");
                    // Crear la nueva lista
                    const OcultarListaNueva = OcultarListaInput ? [OcultarListaInput] : GM_getValue("ocultarHilos", []);
                    const nuevaLista = resaltarListaInput ? [resaltarListaInput] : GM_getValue("resaltarHilos", []);
                    const ignorarLista = ocultarContactosListaInput ? [ocultarContactosListaInput] : GM_getValue("ocultarContactos", []);
                    const ContactosLista = resaltarMensajesContactostListaInput ? [resaltarMensajesContactostListaInput] : GM_getValue("resaltarContactos", []);
                    // Guardar la nueva lista
                    if (OcultarListaNueva.length > 0) {
                        GM_setValue("ocultarHilos", OcultarListaNueva);
                    }
                    if (nuevaLista.length > 0) {
                        GM_setValue("resaltarHilos", nuevaLista);
                    }
                    if (ignorarLista.length > 0) {
                        GM_setValue("ocultarContactos", ignorarLista);
                    }
                    if (ContactosLista.length > 0) {
                        GM_setValue("resaltarContactos", ContactosLista);
                    }
                    toastr["success"](`Las listas se han guardado correctamente shur &nbsp;<img src="https://forocoches.com/foro/images/smilies/thumbsup.gif"></a>`, `Roto2Tools`);

                    // Volver a meter la lista en las cajas
                    ocultarInput.value = GM_getValue("ocultarHilos", []).join(", ");
                    ResaltarInput.value = GM_getValue("resaltarHilos", []).join(", ");
                    ocultarContactosInput.value = GM_getValue("ocultarContactos", []).join(", ");
                    resaltarMensajesContactosInput.value = GM_getValue("resaltarContactos", []).join(", ");

                    // Establecer un temporizador para resetear la variable booleana después de x segundos
                    setTimeout(() => {
                        botonPulsado = false;
                    }, 5000);
                }
            });

            // Inicializamos Tippy.js con el gatillo
            tippy(guardarlistasBtn[0], {
                content: 'Haz clic para guardar las listas',
                animation: 'scale',
                interactive: true,
                placement: 'left', // La ubicación donde se mostrará Tippy
                arrow: true, // Mostrar una flecha en Tippy
            });
            nuevaVentana.append(guardarlistasBtn);

            // agregar el botón de cierre
            const cerrarBtn = $("<button>").text("Cerrar")
                .css({ bottom: "20px", padding: "10px 20px", "border-radius": "6px", "text-shadow": "rgb(0, 0, 0) 1px 1px 4px", "background-color": "rgb(85, 85, 85)", color: "white", cursor: "pointer", "box-shadow": "rgba(0, 0, 0, 0.6) 0px 2px 4px", margin: "5px auto 5px", "margin-top": "15px", transition: "transform 0.3s, box-shadow 0.3s" })
            cerrarBtn.on("click", function () {
                $("html,body").css("overflow", "auto");
                // esperar un breve momento antes de aplicar el efecto de salida
                setTimeout(() => {
                    nuevaVentana.animate({ opacity: "0" }, 300);
                }, 10);
                if (hasGuardado) {
                    toastr["info"](`Recarga la pagina para que Roto2Tools vuelva a leer las listas, gracias y muy buen foro. <img src="https://forocoches.com/foro/images/smilies/number_one.gif"></a>`, `Roto2Tools`);
                    botonPulsado = false;
                }
                // eliminar todas las ventanas emergentes del documento después de que se complete el efecto de salida
                setTimeout(() => {
                    $(".nuevaVentana").remove();
                    // establecer el estado de la ventana emergente en cerrado
                    ventanaAbierta = false;
                }, 500); // Esperar 500ms para que se complete la animación de salida antes de eliminar la ventana
            })
                .on("mousedown", function () { $(this).css({ boxShadow: "none", transform: "translateY(3px)" }); })
                .on("mouseup", function () { $(this).css({ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.6)", transform: "none" }); });
            nuevaVentana.append(cerrarBtn);
        }
    });

    // Función ocultar y resaltar hilos
    let elementos = document.querySelectorAll('section.without-bottom-corners > div');
    let elementosOcultos = [];

    // Función ocultarContactos
    let elementos2 = document.querySelectorAll('section.without-bottom-corners > div');

    elementos2.forEach((el) => {
        if (!el.querySelector('[id*="thread_title_"]>span')) {
            return;
        }
        let title = el.querySelector('.without-top-corners > div > div > div > div > [href^="showthread.php"]');
        let textTitle = title.innerText.toLowerCase();

        if (ocultarContactos.some((palabra) => {
            let regex = getRegex(palabra, false, true);
            return regex.test(textTitle);
        })) {
            elementosOcultos.push(el)
            el.remove()
            ocultarContactos.forEach((palabra) => {
                let regex = getRegex(palabra, false, true);
                let regexTitulo = new RegExp(regex.source, "ig");
                el.style.cssText = "background: #541818; font-size: 0.75rem;";
                title.innerHTML = `{ color: #A4A4A4 !important; }`;
                el.querySelector('[id*="thread_title_"]>span').style.color = '#ffffff';
                let titulo = el.querySelector('a[href^="showthread.php?p="]');
                let span = document.createElement('span');
                let index = textTitle.indexOf('@');
                let nick = textTitle.substring(index, textTitle.indexOf('-', index)).trim();
                let resto = textTitle.substring(nick.length + 1);
                span.innerHTML = '<span style="color: #FF2626; font-weight: bold; font-size: 0.75rem; text-shadow: 1px 1px 4px #000;">' + nick + '</span>&nbsp;<span style="color: var(--gray-text); font-size: 0.75rem;">' + resto + '</span>';
                titulo.parentNode.insertBefore(span, titulo);
                titulo.remove();
            });

            el.style.borderRadius = '5px';
            el.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.6)';
        }
    });

    elementos.forEach((elemento) => {
        if (!elemento.querySelector('[id*="thread_title_"]>span')) {
            return;
        }
        let titulo = elemento.querySelector('[id*="thread_title_"]>span');
        let textoTitulo = titulo.innerText.toLowerCase();
        for (let i = 0; i < resaltarHilos.length; i++) {
            let regex = getRegex(resaltarHilos[i], false, true);
            if (regex.test(textoTitulo)) {
                let regexTitulo = new RegExp(regex.source, "ig");
                elemento.style.cssText = "background: #3D3D3D; font-weight: bold; text-shadow: 1px 1px 4px #000;";
                elemento.querySelector('[id*="thread_title_"]>span').style.color = '#ffffff';
                titulo.innerHTML = titulo.innerHTML.replace(regexTitulo, '<span style="font-weight: bold; color: #EDD40E;">$&</span>');
            }
        }

        if (ocultarHilos.some((palabra) => {
            let regex = getRegex(palabra, false, true);
            return regex.test(textoTitulo);
        })) {
            elementosOcultos.push(elemento)
            elemento.remove()
            ocultarHilos.forEach((palabra) => {
                let regex = getRegex(palabra, false, true);
                let regexTitulo = new RegExp(regex.source, "ig");
                let titulo = elemento.querySelector('[id*="thread_title_"]>span');
                titulo.innerHTML = titulo.innerHTML.replace(regexTitulo, '<span style="font-weight: bold; color: #FD5D4D;">$&</span>');
            });

            elemento.style.borderRadius = '5px';
            elemento.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.6)';
        }
    });

    // Agregar los elementos ocultos a un contenedor
    let contenedorOcultos = document.createElement('div');
    contenedorOcultos.style.maxHeight = '0';
    contenedorOcultos.style.overflow = 'hidden';
    elementosOcultos.forEach((elemento) => {
        elemento.style.margin = '5px 0';
        contenedorOcultos.appendChild(elemento);
    });

    let seMetenAqui = document.querySelector('main>div>section');
    const cantidadHilosOcultos = contenedorOcultos.querySelectorAll('[id*="thread_title_"]').length;

    // Si se han ocultado elementos, agregar el botón spoiler
    if (elementosOcultos.length > 0) {

        // Crear el elemento "spoiler"
        const spoiler = document.createElement('div');
        spoiler.style.cssText = "background: #3A3A3A; color: #ffff; font-weight: bold; text-shadow: 1px 1px 4px #000; text-align: center; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.6); padding: 10px; border-radius: 5px; cursor: pointer; transition: transform 0.3s, box-shadow 0.3s";
        spoiler.addEventListener("mousedown", function () {
            this.style.boxShadow = "none";
            this.style.transform = "translateY(3px)";
        });
        spoiler.addEventListener("mouseup", function () {
            this.style.boxShadow = "0px 2px 4px rgba(0, 0, 0, 0.6)";
            this.style.transform = "none";
        });

        // Agregar el número de hilos ocultados al contenido del spoiler
        spoiler.textContent = cantidadHilosOcultos + ' Hilo(s) oculto(s)';

        // Inicializamos Tippy.js con el gatillo
        tippy(spoiler, {
            content: 'Haz clic para mostrar/ocultar los hilos',
            animation: 'scale',
            interactive: true,
            followCursor: true,
            followCursor: "horizontal",
            placement: 'bottom', // La ubicación donde se mostrará Tippy
            arrow: true, // Mostrar una flecha en Tippy
        });

        // Agregar el contenedor de los elementos ocultos y el botón spoiler a la sección principal
        seMetenAqui.appendChild(contenedorOcultos);
        seMetenAqui.appendChild(spoiler);

        // Agregar un evento de clic para mostrar/ocultar los títulos ocultos
        spoiler.addEventListener('click', () => {
            contenedorOcultos.style.transition = 'max-height 0.3s ease-out';
            if (spoiler.textContent.includes('oculto')) {
                spoiler.textContent = cantidadHilosOcultos + ' Hilo(s) ocultado(s)';
                contenedorOcultos.style.maxHeight = '100vh';
            } else {
                spoiler.textContent = cantidadHilosOcultos + ' Hilo(s) oculto(s)';
                contenedorOcultos.style.maxHeight = '0';
            }
        })
    };

    // Seleccionar todos los hr
    let hrElements = document.querySelectorAll('separator');

    // Función recursiva para eliminar hr adyacentes
    function eliminarAdyacentes(hr) {
        let nextHr = hr.nextElementSibling;
        if (nextHr && nextHr.tagName === 'SEPARATOR' &&
            hr.getBoundingClientRect().bottom === nextHr.getBoundingClientRect().top) {
            nextHr.remove();
            eliminarAdyacentes(hr); // llamada recursiva para eliminar otros hr adyacentes
        }
    };

    // Eliminar los hr que están juntos
    for (let i = 0; i < hrElements.length; i++) {
        eliminarAdyacentes(hrElements[i]);
    };

    // Función para escapar caracteres, quitar comas etc etc
    function getRegexcontacto(userInputcontacto, wholeWordscontacto) {
        if (userInputcontacto.endsWith(',')) {
            userInputcontacto = userInputcontacto.slice(0, -1);
        }
        let escapedInputcontacto = userInputcontacto.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); // escapar caracteres especiales
        let regexStringcontacto = wholeWordscontacto ? `\\b${escapedInputcontacto}\\b` : escapedInputcontacto; // agregar word boundaries si es necesario
        regexStringcontacto = regexStringcontacto.replace(/[áà]/gi, '[aáà]') // acentos
            .replace(/[éè]/gi, '[eéè]')
            .replace(/[íï]/gi, '[iíï]')
            .replace(/[óò]/gi, '[oóò]')
            .replace(/[úü]/gi, '[uúü]')
            .replace(/,\s*/g, '|'); // reemplazar comas por |
        return new RegExp(regexStringcontacto, 'i');
    };

    // para cada contacto en la lista, buscar si hay un elemento que contiene su nombre en el texto
    resaltarContactos.forEach((contacto) => {
        let elementoscontactos = document.querySelectorAll(`[id*="postmenu_"]:not(.resaltado)`);
        elementoscontactos.forEach((elemAmi) => {
            let textocontacto = elemAmi.innerText.toLowerCase();
            let regexcontacto = getRegexcontacto(contacto, true);
            if (regexcontacto.test(textocontacto)) {
                let editcontacto = elemAmi.closest('[id*="edit"]');
                if (editcontacto) {
                    let sectioncontacto = editcontacto.querySelector('section');
                    sectioncontacto.classList.add("resaltado");
                }
            }
        })
    });

    // para cada contacto en la lista, buscar si hay un elemento que contiene su nombre en el texto
    ocultarContactos.forEach((contacto) => {
        let elementosocultarcontactos = document.querySelectorAll(`[id*="edit"]:not(.oculto)`);
        elementosocultarcontactos.forEach((editcontacto) => {
            let postmenuElem = editcontacto.querySelector(':scope [id*="postmenu_"]:not(.oculto)');
            if (!postmenuElem) {
                postmenuElem = editcontacto.querySelector(':scope .without-top-corners:not(.oculto)');
            }
            if (postmenuElem) {
                let textocontacto = postmenuElem.innerText.toLowerCase();
                let regexcontacto = getRegexcontacto(contacto, true);
                if (regexcontacto.test(textocontacto)) {
                    let sectioncontacto = editcontacto.querySelector('section');
                    sectioncontacto.classList.add("oculto");
                    editcontacto.classList.add("oculto");
                }
            }
        })
    });

    // agregar estilos a los elementos resaltados dentro de [id*="edit"] > section
    const usecontacto = document.createElement("style");
    usecontacto.innerHTML = `[id*="edit"] > section.resaltado { border-left: solid 4px #2fc726 !important; }`;
    document.head.appendChild(usecontacto);

    // buscar y ocultar secciones con la clase "oculto" dentro de un spoiler
    const seccionesOcultas = document.querySelectorAll('[id*="edit"].oculto');
    seccionesOcultas.forEach((seccion) => {
        // crear un elemento de spoiler y agregarlo a la página
        const spoiler = document.createElement("details");
        spoiler.classList.add("spoiler");
        seccion.before(spoiler);

        // mover la sección oculta dentro del spoiler y agregar un botón para expandir/cerrar el spoiler
        spoiler.appendChild(seccion);
        const botonSpoiler = document.createElement("summary");
        botonSpoiler.innerText = "El mensaje de este usuario esta oculto por que está en la lista de Ocultar Usuarios";
        botonSpoiler.style.cssText = "background: #3D3D3D; text-align: center; text-shadow: 1px 1px 4px #000; box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.6); cursor: pointer; color: #ffff; font-weight: bold; transition: transform 0.3s, box-shadow 0.3s";
        spoiler.style.cssText = "background: #2A2A2A; border-radius: 5px; margin-bottom: 15px; box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.6); padding: 5px; transition: transform 0.3s, box-shadow 0.3s";
        spoiler.insertBefore(botonSpoiler, seccion);
        spoiler.addEventListener("mousedown", function () {
            spoiler.style.boxShadow = "none";
            spoiler.style.transform = "translateY(3px)";
        });
        spoiler.addEventListener("mouseup", function () {
            spoiler.style.boxShadow = "0px 2px 4px rgba(0, 0, 0, 0.6)";
            spoiler.style.transform = "none";
        });
      
        // Inicializamos Tippy.js con el gatillo
        tippy(spoiler, {
            content: 'Haz clic para mostrar/ocultar los hilos',
            animation: 'scale',
            interactive: true,
            followCursor: false,
            followCursor: "horizontal",
            placement: 'bottom', // La ubicación donde se mostrará Tippy
            arrow: true, // Mostrar una flecha en Tippy
        });
        var separatorLargeElement = seccion.querySelector('separator-large');
        separatorLargeElement.remove();
    });

    // Arregla el ancho de la pagina para que se adapte a la pantalla
    $('#header').css({ 'max-width': 'unset', 'margin': 'unset', 'width': '100%' });
    $('main').css({ 'margin': '0', 'width': '100%', 'max-width': 'unset', 'grid-template-columns': '1fr auto' });
};
