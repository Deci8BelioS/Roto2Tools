// ==UserScript==
// @id              Roto2Tools dev
// @name            Roto2Tools dev
// @namespace       Roto2Tools dev
// @author          DeciBelioS
// @homepage        https://github.com/Deci8BelioS/Roto2Tools/
// @description     Script para Forocoches que oculta hilos o los resalta con las palabras añadidas por el usuario
// @icon            https://raw.githubusercontent.com/Deci8BelioS/Roto2Tools/dev/resources/img/icon-48x48.png
// @icon64          https://raw.githubusercontent.com/Deci8BelioS/Roto2Tools/dev/resources/img/icon-64x64.png
// @updateURL       https://raw.githubusercontent.com/Deci8BelioS/Roto2Tools/dev/Roto2Tools-dev.user.js
// @version         1.2.6d
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
// @resource        toastrcss  https://raw.githubusercontent.com/Deci8BelioS/Roto2Tools/main/resources/require/toastr.min.css
// ==/UserScript==

// Seleccionar el elemento "header"
const header = document.querySelector("#header");

// Cargar y agregar el archivo CSS de toastr como recurso y estilo en la página
const toastrcss = GM_getResourceText('toastrcss');
GM_addStyle(toastrcss);
toastr.options = { "closeButton": false, "debug": false, "newestOnTop": false, "progressBar": true, "positionClass": "toast-bottom-right", "preventDuplicates": true, "onclick": null, "showDuration": "350", "hideDuration": "1000", "timeOut": "6000", "extendedTimeOut": "2000", "showEasing": "swing", "hideEasing": "linear", "showMethod": "fadeIn", "hideMethod": "fadeOut" };

// Si estas en modo telefno no funciona el script
let telefono = header.querySelector("#fc-mobile-version-tag-for-monitoring");

// Si no estas logeado no funciona el script
let noShur = header.querySelector("#user-online-status");

// Si estas logeado y en el pc (o modo escritorio) se ejecuta el script
if (telefono) {
    toastr["warning"](`No funciona en telefonos &nbsp;<img src="https://forocoches.com/foro/images/smilies/smash2.gif"></a>`, `Roto2Tools`);
} else if (!noShur) {
    toastr["error"](`No funciona si no estas logeado`, `Roto2Tools &nbsp;<img src="https://forocoches.com/foro/images/smilies/nono.gif"></a>`);
} else {
    // leer la lista guardada en Tampermonkey
    let resaltarHilos = GM_getValue("resaltarHilos", []);
    let ocultarHilos = GM_getValue("ocultarHilos", []);
    let resaltarContactos = GM_getValue("resaltarContactos", []);

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
    const buttonContainer = document.createElement("div");
    buttonContainer.style.cssText = "display: flex; justify-content: flex-end; align-items: center; margin-right: 20px;";

    // Crear el primer botón
    const menuBtn = document.createElement("button");
    menuBtn.textContent = "Roto2Tools";
    menuBtn.style.cssText = "background-color: #FF5A4B; color: white; padding: 10px 20px; font-weight: bold; text-shadow: 1px 1px 4px #000; border-radius: 6px; cursor: pointer; margin-left: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);";
    buttonContainer.appendChild(menuBtn);

    // Buscar el elemento "#searchform-desktop"
    let Roto2Tools = header.querySelector("#searchform-desktop");

    // Insertar el contenedor de botones después del elemento "#searchform-desktop" si existe, de lo contrario no lo hará
    if (Roto2Tools) {
        header.insertBefore(buttonContainer, Roto2Tools.nextSibling || null);
    };

    // crear una variable global para controlar el estados
    let ventanaAbierta = false;
    let botonPulsado = false;
    let hasGuardado = false;

    // escuchar eventos de clic en el botón de menu
    menuBtn.addEventListener("click", () => {
        // Verificar si el botón ha sido pulsado previamente
        if (ventanaAbierta) {
            toastr["error"](`Ya tienes el menú abierto ¿Por que quieres abrirlo otra vez? &nbsp;<img src="https://forocoches.com/foro/images/smilies/goofy.gif"></a>`, `Roto2Tools`);
            return;
        }
        // verificar si hay una ventana emergente abierta
        if (!ventanaAbierta) {
            // establecer el estado de la ventana emergente en abierto
            ventanaAbierta = true;

            // Crear un fondo oscuro para la ventana emergente
            Object.assign(document.body.style, { overflow: "hidden", position: "fixed" });

            // Crear una nueva ventana emergente
            const nuevaVentana = document.createElement("div");
            nuevaVentana.classList.add("nuevaVentana"); // Agregar una clase para identificar la ventana emergente
            Object.assign(nuevaVentana.style, { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", border: "5px solid #2A2A2A", borderRadius: "6px", boxShadow: "0 2px 6px rgba(0, 0, 0, 1)", backgroundColor: "#2A2A2A", zIndex: "9999", padding: "20px", textAlign: "center", opacity: "0" });
            document.body.appendChild(nuevaVentana);

            // Esperar un breve momento para aplicar el efecto de entrada
            setTimeout(() => {
                nuevaVentana.style.transition = 'opacity 0.3s ease'; // Duración de la animación y tipo de efecto
                nuevaVentana.style.opacity = '1'; // Cambiar la opacidad a 1 para el efecto de entrada
            }, 10);

            // Crear el título de la caja de resaltar hilos
            const resaltarHilosTitulo = document.createElement("div");
            resaltarHilosTitulo.textContent = "Resaltar hilos";
            resaltarHilosTitulo.style.cssText = "padding: 5px; border: 5px solid rgb(58, 58, 58); color: #EDD40E; text-shadow: rgb(0, 0, 0) 1px 1px 4px; margin: 0px auto 10px; width: 145px; font-weight: bold; box-shadow: rgba(0, 0, 0, 0.6) 0px 2px 6px; border-radius: 6px; background-color: rgb(58, 58, 58);";
            nuevaVentana.appendChild(resaltarHilosTitulo);

            // Crear textarea para agregar palabras a resaltar
            const ResaltarInput = document.createElement("textarea");
            ResaltarInput.placeholder = "Agregar palabras a resaltar separadas por comas, ejemplo: palabra, palabra";
            ResaltarInput.value = resaltarHilos.join(", "); // Agregar lista como valor inicial
            ResaltarInput.style.cssText = "background-color: rgb(58, 58, 58); color: white; padding: 10px; border-radius: 6px; box-shadow: rgba(0, 0, 0, 0.6) 0px 2px 4px; text-shadow: rgb(0, 0, 0) 1px 1px 4px; font-weight: bold; width: 320px; height: 80px; resize: none;";
            nuevaVentana.appendChild(ResaltarInput);

            // Crear contenedor para el área de ocultar hilos
            const ocultarHilosContainer = document.createElement("div");
            ocultarHilosContainer.style.cssText = "display: flex; align-items: center; margin-bottom: 10px;";
            nuevaVentana.appendChild(ocultarHilosContainer);

            // Crear el título de la caja de ocultar hilos
            const ocultarHilosTitulo = document.createElement("div");
            ocultarHilosTitulo.textContent = "Ocultar hilos";
            ocultarHilosTitulo.style.cssText = "padding: 5px; border: 5px solid rgb(58, 58, 58); color: #FD5D4D; text-shadow: rgb(0, 0, 0) 1px 1px 4px; margin: 0px auto 10px; width: 145px; font-weight: bold; box-shadow: rgba(0, 0, 0, 0.6) 0px 2px 6px; border-radius: 6px; background-color: rgb(58, 58, 58);";
            nuevaVentana.appendChild(ocultarHilosTitulo);

            // Crear textarea para agregar palabras a ocultar
            const ocultarInput = document.createElement("textarea");
            ocultarInput.placeholder = "Agregar palabras a ocultar separadas por comas, ejemplo: palabra, palabra";
            ocultarInput.value = ocultarHilos.join(", "); // Agregar lista como valor inicial
            ocultarInput.style.cssText = "background-color: rgb(58, 58, 58); color: white; padding: 10px; border-radius: 6px; box-shadow: rgba(0, 0, 0, 0.6) 0px 2px 4px; text-shadow: rgb(0, 0, 0) 1px 1px 4px; font-weight: bold; width: 320px; height: 160px; resize: none;";
            nuevaVentana.appendChild(ocultarInput);

            // Crear el botón para guardar las listas
            const guardarlistasBtn = document.createElement("button");
            guardarlistasBtn.textContent = "GUARDAR";
            guardarlistasBtn.style.cssText = "background-color: rgb(255, 90, 75); color: white; font-weight: bold; padding: 10px 20px; border-radius: 6px; text-shadow: rgb(0, 0, 0) 1px 1px 4px; cursor: pointer; box-shadow: rgba(0, 0, 0, 0.6) 0px 2px 4px; display: block; margin: 5px auto; margin-top: 15px;";
            guardarlistasBtn.addEventListener("click", () => {
                // Verificar si el botón ha sido pulsado previamente
                if (botonPulsado) {
                    toastr["error"](`No des tantos clics cowboy <img src="https://forocoches.com/foro/images/smilies/para.gif"></a>`, `Roto2Tools`);
                    return;
                }
                // Establecer variable a true para indicar que el botón ha sido pulsado
                botonPulsado = true;
                hasGuardado = true;
                const OcultarListaInput = ocultarInput.value.trim();
                const resaltarListaInput = ResaltarInput.value.trim();
                if (OcultarListaInput || resaltarListaInput) {

                    // Eliminar la lista anterior
                    GM_deleteValue("ocultarHilos");
                    GM_deleteValue("resaltarHilos");

                    // Crear la nueva lista
                    const OcultarListaNueva = OcultarListaInput ? [OcultarListaInput] : GM_getValue("ocultarHilos", []);
                    const nuevaLista = resaltarListaInput ? [resaltarListaInput] : GM_getValue("resaltarHilos", []);

                    // Guardar la nueva lista
                    if (OcultarListaNueva.length > 0) {
                        GM_setValue("ocultarHilos", OcultarListaNueva);
                    }
                    if (nuevaLista.length > 0) {
                        GM_setValue("resaltarHilos", nuevaLista);
                    }

                    toastr["success"](`Las listas se han guardado correctamente shur &nbsp;<img src="https://forocoches.com/foro/images/smilies/thumbsup.gif"></a>`, `Roto2Tools`);

                    // Volver a meter la lista en las cajas
                    ocultarInput.value = GM_getValue("ocultarHilos", []).join(", ");
                    ResaltarInput.value = GM_getValue("resaltarHilos", []).join(", ");

                    // Establecer un temporizador para resetear la variable booleana después de x segundos
                    setTimeout(() => {
                        botonPulsado = false;
                    }, 5000);
                }
            });

            nuevaVentana.appendChild(guardarlistasBtn);

            // agregar el botón de cierre
            let cerrarBtn = document.createElement("button");
            cerrarBtn.textContent = "Cerrar";
            cerrarBtn.style.cssText = "bottom: 20px; padding: 10px 20px; border-radius: 6px; text-shadow: rgb(0, 0, 0) 1px 1px 4px; background-color: rgb(85, 85, 85); color: white; cursor: pointer; box-shadow: rgba(0, 0, 0, 0.6) 0px 2px 4px; margin: 5px auto 5px; margin-top: 15px;";
            cerrarBtn.addEventListener("click", () => {
                document.documentElement.style.overflow = "auto";
                document.body.style.overflow = "auto";
                // esperar un breve momento antes de aplicar el efecto de salida
                setTimeout(() => {
                    nuevaVentana.style.transition = 'opacity 0.3s ease'; // Duración de la animación y tipo de efecto
                    nuevaVentana.style.opacity = '0'; // Cambiar la opacidad a 0 para el efecto de salida
                }, 10);
                if (hasGuardado) {
                    toastr["info"](`Recarga la pagina para que Roto2Tools vuelva a leer las listas, gracias y muy buen foro. <img src="https://forocoches.com/foro/images/smilies/number_one.gif"></a>`, `Roto2Tools`);
                    botonPulsado = false;
                }
                // eliminar todas las ventanas emergentes del documento después de que se complete el efecto de salida
                setTimeout(() => {
                    let ventanas = document.getElementsByClassName("nuevaVentana");
                    while (ventanas.length > 0) {
                        ventanas[0].parentNode.removeChild(ventanas[0]);
                    }
                    // establecer el estado de la ventana emergente en cerrado
                    ventanaAbierta = false;
                }, 500); // Esperar 500ms para que se complete la animación de salida antes de eliminar la ventana
            })
            nuevaVentana.appendChild(cerrarBtn);
        }
    });

    // Función ocultar y resaltar hilos
    let elementos = document.querySelectorAll('section.without-bottom-corners > div');
    let elementosOcultos = [];

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

    // Si se han ocultado elementos, agregar el botón spoiler
    if (elementosOcultos.length > 0) {
        // Crear el elemento "spoiler"
        const spoiler = document.createElement('div');
        spoiler.style.cssText = "background: #3A3A3A; color: #ffff; font-weight: bold; text-shadow: 1px 1px 4px #000; text-align: center; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.6); padding: 10px; border-radius: 5px; cursor: pointer;";

        // Agregar el número de hilos ocultados al contenido del spoiler
        spoiler.textContent = elementosOcultos.length + ' Hilo(s) oculto(s)';

        // Agregar el contenedor de los elementos ocultos y el botón spoiler a la sección principal
        seMetenAqui.appendChild(contenedorOcultos);
        seMetenAqui.appendChild(spoiler);

        // Agregar un evento de clic para mostrar/ocultar los títulos ocultos
        spoiler.addEventListener('click', () => {
            contenedorOcultos.style.transition = 'max-height 350ms ease-out';
            if (spoiler.textContent.includes('oculto')) {
                spoiler.textContent = elementosOcultos.length + ' Hilo(s) ocultado(s)';
                contenedorOcultos.style.maxHeight = '100vh';
            } else {
                spoiler.textContent = elementosOcultos.length + ' Hilo(s) oculto(s)';
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


    // Obtener la URL actual
    const currentUrl = window.location.href;

    // Verificar si la URL es la correcta
    if (!currentUrl.includes('https://forocoches.com/foro/profile.php?do=buddylist')) {
    } else {

        // Crear botón contactos
        const contactosBtn = document.createElement("button");
        contactosBtn.textContent = "Contactos";
        contactosBtn.style.cssText = "background-color: #FF5A4B; color: white; padding: 10px 20px; font-weight: bold; text-shadow: 1px 1px 4px #000; border-radius: 6px; cursor: pointer; margin-left: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);";
        buttonContainer.appendChild(contactosBtn);

        // Buscar el elemento "#searchform-desktop"
        let Contactos = header.querySelector("#searchform-desktop");

        // Insertar el contenedor de botones después del elemento "#searchform-desktop" si existe, de lo contrario no lo hará
        if (Contactos) {
            header.insertBefore(buttonContainer, Contactos.nextSibling || null);
        };

        // escuchar eventos de clic en el botón de menu
        contactosBtn.addEventListener("click", () => {
            // Verificar si el botón ha sido pulsado previamente
            if (ventanaAbierta) {
                toastr["error"](`Ya tienes el menú abierto ¿Por que quieres abrirlo otra vez? &nbsp;<img src="https://forocoches.com/foro/images/smilies/goofy.gif"></a>`, `Roto2Tools`);
                return;
            }
            // verificar si hay una ventana emergente abierta
            if (!ventanaAbierta) {
                // establecer el estado de la ventana emergente en abierto
                ventanaAbierta = true;

                // Crear una nueva ventana emergente
                const nuevaVentana2 = document.createElement("div");
                nuevaVentana2.classList.add("nuevaVentana"); // Agregar una clase para identificar la ventana emergente
                Object.assign(nuevaVentana2.style, { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", border: "5px solid #2A2A2A", borderRadius: "6px", boxShadow: "0 2px 6px rgba(0, 0, 0, 1)", backgroundColor: "#2A2A2A", zIndex: "9999", padding: "20px", textAlign: "center", opacity: "0" });
                document.body.appendChild(nuevaVentana2);

                // Esperar un breve momento para aplicar el efecto de entrada
                setTimeout(() => {
                    nuevaVentana2.style.transition = 'opacity 0.3s ease'; // Duración de la animación y tipo de efecto
                    nuevaVentana2.style.opacity = '1'; // Cambiar la opacidad a 1 para el efecto de entrada
                }, 10);

                // Crear el título de la caja de resaltar Contactos
                const resaltarContactosTitulo = document.createElement("div");
                resaltarContactosTitulo.textContent = "Lista guardada";
                resaltarContactosTitulo.style.cssText = "padding: 5px; border: 5px solid rgb(58, 58, 58); color: white; margin: 0px auto 10px; width: 145px; font-weight: bold; box-shadow: rgba(0, 0, 0, 0.6) 0px 2px 6px; border-radius: 6px; background-color: rgb(58, 58, 58);";
                nuevaVentana2.appendChild(resaltarContactosTitulo);
                // Crear el título de la caja de resaltar Contactos
                const resaltarContactosTitulo3 = document.createElement("div");
                resaltarContactosTitulo3.textContent = "Esto solo es una lista de contactos guardada para ver, no se puede modificar";
                resaltarContactosTitulo3.style.cssText = "padding: 5px; color: white; font-size: 12px; width: 290px; display: block; margin: 5px auto 5px;";
                nuevaVentana2.appendChild(resaltarContactosTitulo3);

                // Crear div para ver resaltar Contactos
                const resaltarContactosDiv = document.createElement("div");
                resaltarContactosDiv.style.cssText = "background-color: rgb(58, 58, 58); color: white; padding: 10px; border-radius: 6px; box-shadow: rgba(0, 0, 0, 0.6) 0px 2px 4px; text-shadow: rgb(0, 0, 0) 1px 1px 4px; font-weight: bold; width: 290px; height: auto;";
                if (resaltarContactos.length > 0) {
                    resaltarContactosDiv.textContent = resaltarContactos.join(", ");
                } else {
                    resaltarContactosDiv.textContent = "Lista vacía...";
                }
                // resaltarContactosDiv.setAttribute("contenteditable", "false"); // Desactivar edición
                nuevaVentana2.appendChild(resaltarContactosDiv);

                // Crear el título de la caja de resaltar Contactos
                const resaltarContactosTitulo2 = document.createElement("div");
                resaltarContactosTitulo2.textContent = "Si le das al boton guardar contactos leerá los contactos que tienes agregados en forocoches y guardará la nueva lista";
                resaltarContactosTitulo2.style.cssText = "padding: 5px; color: white; margin-top: 5%; margin-bottom: 20px; font-size: 12px; width: 290px; display: block; margin: 0 auto; margin-top: 5%;";
                nuevaVentana2.appendChild(resaltarContactosTitulo2);

                // Crear botón para guardar lista de contactos
                const GuardarContactosBtn = document.createElement('button');
                GuardarContactosBtn.textContent = 'Guardar contactos';
                GuardarContactosBtn.style.cssText = "background-color: rgb(255, 90, 75); color: white; font-weight: bold; padding: 10px 20px; border-radius: 6px; text-shadow: rgb(0, 0, 0) 1px 1px 4px; cursor: pointer; box-shadow: rgba(0, 0, 0, 0.6) 0px 2px 4px; display: block; margin: 5px auto; margin-top: 15px;";
                GuardarContactosBtn.addEventListener('click', () => {
                    if (botonPulsado) {
                        toastr["error"](`No des tantos clics cowboy <img src="https://forocoches.com/foro/images/smilies/para.gif"></a>`, `Roto2Tools`);
                        return;
                    }
                    botonPulsado = true;

                    // Obtener la lista de elementos que contienen los nombres de los contactos en la página de buddylist
                    let contactosElements = document.querySelectorAll('[id^="buddylist_user"] > [href^="member.php"]');

                    // Verificar si se encontraron contactos
                    if (contactosElements.length === 0) {
                        toastr["info"](`No se encontraron contactos en la lista. <img src="https://forocoches.com/foro/images/smilies/nusenuse.gif"></a>`, `Roto2Tools`);
                    } else {
                        // Crear un array vacío para almacenar los nombres de los contactos
                        let contactos = [];

                        // Iterar sobre los elementos y obtener el nombre de cada contacto
                        contactosElements.forEach((contactoElement) => {
                            let contactoNombre = contactoElement.textContent.trim();
                            contactos.push(contactoNombre);
                        });

                        // Convertir el array de contactos en una cadena de texto
                        let contactosString = contactos.join(', ');

                        // Guardar la cadena de contactos en el objeto JSON actualizado en GM_setValue
                        GM_setValue("resaltarContactos", [contactosString]);
                        toastr["success"](`Los contactos se han guardado correctamente shur &nbsp;<img src="https://forocoches.com/foro/images/smilies/thumbsup.gif"></a>`, `Roto2Tools`);
                        hasGuardado = true;
                    }
                    // Establecer un temporizador para resetear la variable booleana después de x segundos
                    setTimeout(() => {
                        botonPulsado = false;
                    }, 5000);
                });

                // Agregar botón a la ventana
                nuevaVentana2.appendChild(GuardarContactosBtn);

                // agregar el botón de cierre
                let cerrarContactosBtn = document.createElement("button");
                cerrarContactosBtn.textContent = "Cerrar";
                cerrarContactosBtn.style.cssText = "bottom: 20px; padding: 10px 20px; border-radius: 6px; text-shadow: rgb(0, 0, 0) 1px 1px 4px; background-color: rgb(85, 85, 85); color: white; cursor: pointer; box-shadow: rgba(0, 0, 0, 0.6) 0px 2px 4px; margin: 5px auto 5px; margin-top: 15px;";
                cerrarContactosBtn.addEventListener("click", () => {
                    document.documentElement.style.overflow = "auto";
                    document.body.style.overflow = "auto";
                    // esperar un breve momento antes de aplicar el efecto de salida
                    setTimeout(() => {
                        nuevaVentana2.style.transition = 'opacity 0.3s ease'; // Duración de la animación y tipo de efecto
                        nuevaVentana2.style.opacity = '0'; // Cambiar la opacidad a 0 para el efecto de salida
                    }, 10);
                    if (hasGuardado) {
                        toastr["info"](`Recarga la pagina para que Roto2Tools vuelva a leer las listas, gracias y muy buen foro. <img src="https://forocoches.com/foro/images/smilies/number_one.gif"></a>`, `Roto2Tools`);
                        botonPulsado = false;
                    }
                    // eliminar todas las ventanas emergentes del documento después de que se complete el efecto de salida
                    setTimeout(() => {
                        let ventanas = document.getElementsByClassName("nuevaVentana");
                        while (ventanas.length > 0) {
                            ventanas[0].parentNode.removeChild(ventanas[0]);
                        }
                        // establecer el estado de la ventana emergente en cerrado
                        ventanaAbierta = false;
                    }, 500); // Esperar 500ms para que se complete la animación de salida antes de eliminar la ventana
                });
                nuevaVentana2.appendChild(cerrarContactosBtn);
            }
        })
    };

    // Función para escapar caracteres, quitar comas etc etc
    function getRegexcontacto(userInputcontacto, wholeWordscontacto) {
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

    // agregar estilos a los elementos resaltados dentro de [id*="edit"] > section
    const usecontacto = document.createElement("style");
    usecontacto.innerHTML = `[id*="edit"] > section.resaltado { border-left: solid 4px #2fc726 !important; }`;
    document.head.appendChild(usecontacto);

    // Arregla el ancho de la pagina para que se adapte a la pantalla
    document.querySelector('#header').style = 'max-width: unset; margin: unset; width: 100%;';
    document.querySelector('main').style = 'margin: 0; width: 100%; max-width: unset; grid-template-columns: 1fr auto;';
};
