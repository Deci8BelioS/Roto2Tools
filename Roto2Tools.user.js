// ==UserScript==
// @id              Roto2Tools
// @name            Roto2Tools
// @namespace       Roto2Tools
// @author          DeciBelioS
// @homepage        https://github.com/Deci8BelioS/Roto2Tools/
// @description     Script para Forocoches que oculta hilos o los resalta con las palabras añadidas por el usuario
// @icon            https://github.com/Deci8BelioS/Roto2Tools/raw/main/resources/img/icon-48x48.png
// @icon64          https://github.com/Deci8BelioS/Roto2Tools/raw/main/resources/img/icon-64x64.png
// @updateURL       https://github.com/Deci8BelioS/Roto2Tools/raw/main/Roto2Tools.user.js
// @version         1.0.7b
// @encoding        UTF-8
// @include         http://www.forocoches.com/*
// @include         http://forocoches.com/*
// @include         https://www.forocoches.com/*
// @include         https://forocoches.com/*
// @grant           GM_xmlhttpRequest
// @grant           GM_addStyle
// @grant           GM_setValue
// @grant           GM_getValue
// @grant           GM_deleteValue
// @grant           GM_listValues
// @grant           GM_openInTab
// @require         https://code.jquery.com/jquery-3.6.4.min.js
// @require         https://raw.githubusercontent.com/CodeSeven/toastr/master/toastr.js
// @compatible      chrome
// @compatible      firefox
// @compatible      opera
// @compatible      safari
// @compatible      edge
// @run-at          document-end
// ==/UserScript==

document.charset = "UTF-8";

// leer la lista guardada en Tampermonkey
let resaltarHilos = GM_getValue("resaltarHilos", []);
let ocultarHilos = GM_getValue("ocultarHilos", []);

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
}

// Seleccionar el elemento "header"
const header = document.querySelector("#header");

// Crear un contenedor para los botones
const buttonContainer = document.createElement("div");
buttonContainer.style.cssText = "display: flex; justify-content: flex-end; align-items: center; margin-right: 20px;";

// Crear el primer botón
const menuBtn = document.createElement("button");
menuBtn.textContent = "Roto2Tools";
menuBtn.style.cssText = "background-color: #FF5A4B; color: white; padding: 10px 20px; font-weight: bold; text-shadow: 1px 1px 4px #000; border-radius: 6px; cursor: pointer; margin-left: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);";
buttonContainer.appendChild(menuBtn);

// Buscar el elemento "header-showthread-info"
let threadInfo = header.querySelector(".header-showthread-info");

// Insertar el contenedor de botones después del elemento "forocoches-logo" si existe, de lo contrario insertarlo después de "forocoches-logo"
if (threadInfo) {
  header.insertBefore(buttonContainer, threadInfo.nextSibling);
} else {
  let forocochesLogo = header.querySelector(".forocoches-logo");
  header.insertBefore(buttonContainer, forocochesLogo.nextSibling);
};

// Obtener lista de palabras a ocultar
let ocultarLista = GM_getValue("ocultarHilos", []);

// Obtener lista de palabras a resaltar
let resaltarLista = GM_getValue("resaltarHilos", []);

// crear una variable global para controlar el estado de la ventana emergente
let ventanaAbierta = false;

// escuchar eventos de clic en el botón de menu
menuBtn.addEventListener("click", () => {
  // Verificar si el botón ha sido pulsado previamente
  if (ventanaAbierta) {
    (function () {
      'use strict';
      GM_xmlhttpRequest({
        method: 'GET',
        url: 'https://github.com/Deci8BelioS/Roto2Tools/raw/main/resources/require/toastr.min.css',
        onload: function (response) {
          GM_addStyle(response.responseText);
          initializeToastr();
        }
      });
      function initializeToastr() {
        toastr.options = {
          "closeButton": false, "debug": false, "newestOnTop": false, "progressBar": true, "positionClass": "toast-bottom-right", "preventDuplicates": true, "onclick": null, "showDuration": "500", "hideDuration": "1000", "timeOut": "8000", "extendedTimeOut": "2000", "showEasing": "swing", "hideEasing": "linear", "showMethod": "fadeIn", "hideMethod": "fadeOut"
        };
        toastr["error"](`Ya tienes la ventana abierta ¿Por que quieres abrirla otra vez? :roto2:`);
      }
    })();
    return;
  }
  // verificar si hay una ventana emergente abierta
  if (!ventanaAbierta) {
    // establecer el estado de la ventana emergente en abierto
    ventanaAbierta = true;

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

    // Crear contenedor para el área de resaltar hilos
    const resaltarHilosContainer = document.createElement("div");
    resaltarHilosContainer.style.cssText = "display: flex; align-items: center; margin-bottom: 10px;";
    nuevaVentana.appendChild(resaltarHilosContainer);

    // Crear el título de la caja de resaltar hilos
    const resaltarHilosTitulo = document.createElement("div");
    resaltarHilosTitulo.textContent = "Resaltar hilos (separado por comas)";
    resaltarHilosTitulo.style.cssText = "padding: 5px; border: 5px solid #3A3A3A; color: white; margin-top: 5%; margin-bottom: 20px; font-weight: bold; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.6); border-radius: 6px; background-color: #3A3A3A;";
    nuevaVentana.appendChild(resaltarHilosTitulo);

    // Crear textarea para agregar palabras a resaltar
    const ResaltarInput = document.createElement("textarea");
    ResaltarInput.placeholder = "Agregar palabras a resaltar...";
    ResaltarInput.style.cssText = "background-color: rgb(58, 58, 58); color: white; padding: 10px; border-radius: 6px; box-shadow: rgba(0, 0, 0, 0.6) 0px 2px 4px; text-shadow: rgb(0, 0, 0) 1px 1px 4px; font-weight: bold; width: 290px; height: 68px; resize: none;";
    ResaltarInput.value = resaltarHilos.join(", "); // Agregar lista como valor inicial

    // Crear variable booleana para verificar si se ha pulsado el botón previamente
    let botonPulsado = false;

    // Crear el botón para guardar palabras a resaltar
    const guardarResaltarBtn = document.createElement("button");
    guardarResaltarBtn.textContent = "GUARDAR";
    guardarResaltarBtn.style.cssText = "background-color: #FF5A4B; color: white; font-weight: bold; padding: 10px 20px; border-radius: 6px; text-shadow: 1px 1px 4px #000; cursor: pointer; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.6); display: block; margin: 0 auto; margin-top: 5%;";
    guardarResaltarBtn.addEventListener("click", () => {
      // Verificar si el botón ha sido pulsado previamente
      if (botonPulsado) {
        (function () {
          'use strict';
          GM_xmlhttpRequest({
            method: 'GET',
            url: 'https://github.com/Deci8BelioS/Roto2Tools/raw/main/resources/require/toastr.min.css',
            onload: function (response) {
              GM_addStyle(response.responseText);
              initializeToastr();
            }
          });
          function initializeToastr() {
            toastr.options = {
              "closeButton": false, "debug": false, "newestOnTop": false, "progressBar": true, "positionClass": "toast-bottom-right", "preventDuplicates": true, "onclick": null, "showDuration": "500", "hideDuration": "1000", "timeOut": "8000", "extendedTimeOut": "2000", "showEasing": "swing", "hideEasing": "linear", "showMethod": "fadeIn", "hideMethod": "fadeOut"
            };
            toastr["error"](`No des tantos clics cowboy 🔫`);
          }
        })();
        return;
      }

      const resaltarListaInput = ResaltarInput.value.trim();
      if (resaltarListaInput) {
        // Establecer variable a true para indicar que el botón ha sido pulsado
        botonPulsado = true;

        // Eliminar la lista anterior
        GM_deleteValue("resaltarHilos");

        // Crear la nueva lista
        const nuevaLista = [resaltarListaInput];

        // Guardar la nueva lista
        GM_setValue("resaltarHilos", nuevaLista);
        (function () {
          'use strict';
          GM_xmlhttpRequest({
            method: 'GET',
            url: 'https://github.com/Deci8BelioS/Roto2Tools/raw/main/resources/require/toastr.min.css',
            onload: function (response) {
              GM_addStyle(response.responseText);
              initializeToastr();
            }
          });
          function initializeToastr() {
            toastr.options = {
              "closeButton": false, "debug": false, "newestOnTop": false, "progressBar": true, "positionClass": "toast-bottom-right", "preventDuplicates": false, "onclick": null, "showDuration": "500", "hideDuration": "1000", "timeOut": "8000", "extendedTimeOut": "2000", "showEasing": "swing", "hideEasing": "linear", "showMethod": "fadeIn", "hideMethod": "fadeOut"
            };
            toastr["success"](`Se ha actualizado la lista resaltar hilos :)`);
          }
        })();
        ResaltarInput.value = GM_getValue("resaltarHilos", []).join(", ");

        // Establecer un temporizador para resetear la variable booleana después de x segundos
        setTimeout(() => {
          botonPulsado = false;
        }, 5000);
      }
    });
    nuevaVentana.appendChild(ResaltarInput);
    nuevaVentana.appendChild(guardarResaltarBtn);

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Crear contenedor para el área de ocultar hilos
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    const ocultarHilosContainer = document.createElement("div");
    ocultarHilosContainer.style.cssText = "display: flex; align-items: center; margin-bottom: 10px;";
    nuevaVentana.appendChild(ocultarHilosContainer);

    // Crear el título de la caja de ocultar hilos
    const ocultarHilosTitulo = document.createElement("div");
    ocultarHilosTitulo.textContent = "Ocultar hilos (separado por comas)";
    ocultarHilosTitulo.style.cssText = "padding: 5px; border: 5px solid #3A3A3A; color: white; margin-top: 5%; margin-bottom: 20px; font-weight: bold; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.6); border-radius: 6px; background-color: #3A3A3A;";
    nuevaVentana.appendChild(ocultarHilosTitulo);

    // Crear textarea para agregar palabras a ocultar
    const ocultarInput = document.createElement("textarea");
    ocultarInput.placeholder = "Agregar palabra a ocultar...";
    ocultarInput.style.cssText = "background-color: rgb(58, 58, 58); color: white; padding: 10px; border-radius: 6px; box-shadow: rgba(0, 0, 0, 0.6) 0px 2px 4px; text-shadow: rgb(0, 0, 0) 1px 1px 4px; font-weight: bold; width: 290px; height: 68px; resize: none;";
    ocultarInput.value = ocultarHilos.join(", "); // Agregar lista como valor inicial

    // Crear el botón para guardar palabras a ocultar
    const guardarOcultarBtn = document.createElement("button");
    guardarOcultarBtn.textContent = "GUARDAR";
    guardarOcultarBtn.style.cssText = "background-color: #FF5A4B; color: white; font-weight: bold; padding: 10px 20px; border-radius: 6px; text-shadow: 1px 1px 4px #000; cursor: pointer; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.6); display: block; margin: 0 auto; margin-top: 5%;";
    guardarOcultarBtn.addEventListener("click", () => {
      // Verificar si el botón ha sido pulsado previamente
      if (botonPulsado) {
        (function () {
          'use strict';
          GM_xmlhttpRequest({
            method: 'GET',
            url: 'https://github.com/Deci8BelioS/Roto2Tools/raw/main/resources/require/toastr.min.css',
            onload: function (response) {
              GM_addStyle(response.responseText);
              initializeToastr();
            }
          });
          function initializeToastr() {
            toastr.options = {
              "closeButton": false, "debug": false, "newestOnTop": false, "progressBar": true, "positionClass": "toast-bottom-right", "preventDuplicates": true, "onclick": null, "showDuration": "500", "hideDuration": "1000", "timeOut": "8000", "extendedTimeOut": "2000", "showEasing": "swing", "hideEasing": "linear", "showMethod": "fadeIn", "hideMethod": "fadeOut"
            };
            toastr["error"](`No des tantos clics cowboy 🔫`);
          }
        })();
        return;
      }
      const OcultarListaInput = ocultarInput.value.trim();
      if (OcultarListaInput) {
        // Establecer variable a true para indicar que el botón ha sido pulsado
        botonPulsado = true;
        // Eliminar la lista anterior
        GM_deleteValue("ocultarHilos");

        // Crear la nueva lista
        const OcultarListaNueva = [OcultarListaInput];

        // Guardar la nueva lista
        GM_setValue("ocultarHilos", OcultarListaNueva);
        (function () {
          'use strict';
          GM_xmlhttpRequest({
            method: 'GET',
            url: 'https://github.com/Deci8BelioS/Roto2Tools/raw/main/resources/require/toastr.min.css',
            onload: function (response) {
              GM_addStyle(response.responseText);
              initializeToastr();
            }
          });
          function initializeToastr() {
            toastr.options = {
              "closeButton": false, "debug": false, "newestOnTop": false, "progressBar": true, "positionClass": "toast-bottom-right", "preventDuplicates": false, "onclick": null, "showDuration": "500", "hideDuration": "1000", "timeOut": "8000", "extendedTimeOut": "2000", "showEasing": "swing", "hideEasing": "linear", "showMethod": "fadeIn", "hideMethod": "fadeOut"
            };
            toastr["success"](`Se ha actualizado la lista ocultar hilos`);
          }
        })();
        ocultarInput.value = GM_getValue("ocultarHilos", []).join(", ");

        // Establecer un temporizador para resetear la variable booleana después de x segundos
        setTimeout(() => {
          botonPulsado = false;
        }, 5000);
      }
    });

    nuevaVentana.appendChild(ocultarInput);
    nuevaVentana.appendChild(guardarOcultarBtn);

    // agregar el botón de cierre
    let cerrarBtn = document.createElement("button");
    cerrarBtn.textContent = "Cerrar";
    cerrarBtn.style.cssText = "bottom: 20px; padding: 10px 20px; border-radius: 6px; text-shadow: rgb(0, 0, 0) 1px 1px 4px; background-color: rgb(85, 85, 85); color: white; cursor: pointer; box-shadow: rgba(0, 0, 0, 0.6) 0px 2px 4px; display: block; margin: 5% auto 0px;";
    cerrarBtn.addEventListener("click", () => {
      // esperar un breve momento antes de aplicar el efecto de salida
      setTimeout(() => {
        nuevaVentana.style.transition = 'opacity 0.3s ease'; // Duración de la animación y tipo de efecto
        nuevaVentana.style.opacity = '0'; // Cambiar la opacidad a 0 para el efecto de salida
      }, 10);
      (function () {
        'use strict';
        GM_xmlhttpRequest({
          method: 'GET',
          url: 'https://github.com/Deci8BelioS/Roto2Tools/raw/main/resources/require/toastr.min.css',
          onload: function (response) {
            GM_addStyle(response.responseText);
            initializeToastr();
          }
        });
        function initializeToastr() {
          toastr.options = {
            "closeButton": false, "debug": false, "newestOnTop": false, "progressBar": true, "positionClass": "toast-bottom-right", "preventDuplicates": true, "onclick": null, "showDuration": "500", "hideDuration": "1000", "timeOut": "8000", "extendedTimeOut": "2000", "showEasing": "swing", "hideEasing": "linear", "showMethod": "fadeIn", "hideMethod": "fadeOut"
          };
          toastr["info"](`Si has guardado la lista deberás refrescar la pagina para que empieze a aplicarlas`);
        }
      })();
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
    nuevaVentana.appendChild(cerrarBtn);
    document.body.appendChild(nuevaVentana);
  }
});

// Función ocultar y resaltar hilos
let elementos = document.querySelectorAll('section.without-bottom-corners > div');
let elementosOcultos = [];

elementos.forEach((elemento) => {
  if (!elemento.querySelector('[id*="thread_title_"]>span')) {
    return;
  }
  let texto = elemento.querySelector('[id*="thread_title_"]>span').innerText.toLowerCase();
  for (let i = 0; i < resaltarHilos.length; i++) {
    let regex = getRegex(resaltarHilos[i], false, true);
    if (regex.test(texto)) {
      elemento.style.cssText = "background: #3D3D3D; font-weight: bold; text-shadow: 1px 1px 4px #000;";
      elemento.querySelector('[id*="thread_title_"]>span').style.color = '#ffffff';
      break;
    }
  }

  if (ocultarHilos.some((palabra) => {
    let regex = getRegex(palabra, false, true);
    return regex.test(texto);
  })) {
    elementosOcultos.push(elemento)
    elemento.remove()
    ocultarHilos.forEach((palabra) => {
      let regex = getRegex(palabra, false, true);
      let regexTitulo = new RegExp(regex.source, "i")
      let titulo = elemento.querySelector('[id*="thread_title_"]>span');
      let palabraCoincidente = titulo.innerText.match(regexTitulo)[0];
      titulo.innerHTML = titulo.innerHTML.replace(regexTitulo, `<span style="font-weight: bold; color: #FD5D4D;">${palabraCoincidente}</span>`);
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
  });
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

// Arregla el ancho de la pagina para que se adapte a la pantalla
const headerElement = document.querySelector('header');
headerElement.style.boxShadow = 'unset';
headerElement.style.webkitBoxShadow = 'unset';

const headerIdElement = document.querySelector('#header');
headerIdElement.style.maxWidth = 'unset';
headerIdElement.style.margin = 'unset';
headerIdElement.style.width = '100%';

const mainElement = document.querySelector('main');
mainElement.style.margin = '0px';
mainElement.style.width = '100%';
mainElement.style.maxWidth = 'unset';
mainElement.style.gridTemplateColumns = '1fr auto';
