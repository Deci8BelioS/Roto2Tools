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
// @version         1.0.4-2b
// @encoding        UTF-8
// @include         http://www.forocoches.com/*
// @include         http://forocoches.com/*
// @include         https://www.forocoches.com/*
// @include         https://forocoches.com/*
// @grant           GM_getValue
// @grant           GM_setValue
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

// Seleccionar el elemento "header"
const header = document.querySelector("#header");

// Crear un contenedor para los botones
const buttonContainer = document.createElement("div");
    buttonContainer.style.cssText = "display: flex; justify-content: flex-end; align-items: center; margin-right: 20px;";

// Crear el primer botón
const menuBtn = document.createElement("button");
    menuBtn.textContent = "Menú";
    menuBtn.style.cssText = "background-color: #FD5D4D; color: white; padding: 10px 20px; font-weight: bold; border-radius: 6px; cursor: pointer; margin-left: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);";
    buttonContainer.appendChild(menuBtn);

// Crear el segundo botón
const recuperarListasBtn = document.createElement("button");
    recuperarListasBtn.textContent = "Listas";
    recuperarListasBtn.style.cssText = "background-color: #FD5D4D; color: white; padding: 10px 20px; font-weight: bold; border-radius: 6px; cursor: pointer; margin-left: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);";
    buttonContainer.appendChild(recuperarListasBtn);

// Buscar el elemento "header-showthread-info"
let threadInfo = header.querySelector(".header-showthread-info");

// Insertar el contenedor de botones después del elemento "forocoches-logo" si existe, de lo contrario insertarlo después de "forocoches-logo"
    if (threadInfo) {
      header.insertBefore(buttonContainer, threadInfo.nextSibling);
    } else {
      let forocochesLogo = header.querySelector(".forocoches-logo");
      header.insertBefore(buttonContainer, forocochesLogo.nextSibling);
    };

// crear una variable global para controlar el estado de la ventana emergente
let ventanaAbierta = false;

// escuchar eventos de clic en el botón de menu
menuBtn.addEventListener("click", () => {
  // verificar si hay una ventana emergente abierta
  if (!ventanaAbierta) {
    // establecer el estado de la ventana emergente en abierto
    ventanaAbierta = true;

    // Crear una nueva ventana emergente
    const nuevaVentana = document.createElement("div");
        nuevaVentana.classList.add("nuevaVentana"); // Agregar una clase para identificar la ventana emergente
        Object.assign(nuevaVentana.style, {position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", border: "5px solid #2A2A2A", borderRadius: "6px", boxShadow: "0 2px 6px rgba(0, 0, 0, 1)", backgroundColor: "#2A2A2A", zIndex: "9999", padding: "20px", textAlign: "center", opacity: "0"});
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

// Crear el título de la caja de ocultar hilos
const resaltarHilosTitulo = document.createElement("div");
    resaltarHilosTitulo.textContent = "Resaltar hilos (separado por comas)";
    resaltarHilosTitulo.style.cssText = "border: 5px solid #3A3A3A; color: white; margin-bottom: 20px; font-weight: bold; box-shadow: 0 2px 6px rgba(0, 0, 0, 1); border-radius: 6px; background-color: #3A3A3A;";
    nuevaVentana.appendChild(resaltarHilosTitulo);

// Crear el input para añadir palabras a resaltar
const agregarPalabraInput = document.createElement("input");
    agregarPalabraInput.placeholder = "Añadir palabra a resaltar";
    agregarPalabraInput.style.cssText = "padding: 8px 12px; border: 1px solid #FD5D4D; box-shadow: 0 2px 6px rgba(0, 0, 0, 1); border-radius: 5px; margin-right: 5px; margin-left: 5px;";
    nuevaVentana.appendChild(agregarPalabraInput);

// Crear el botón para añadir palabras a resaltar
const agregarPalabraBtn = document.createElement("button");
    agregarPalabraBtn.textContent = "Añadir";
    agregarPalabraBtn.style.cssText = "background-color: #32CD32; color: white; padding: 10px 20px; font-weight: bold; border-radius: 6px; cursor: pointer; margin-left: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);";
    agregarPalabraBtn.addEventListener("click", () => {
      const regex = /^\s*(?:[a-zA-Z0-9]+|[+-]?\d+(?:\.\d+)?)(?:\s*,\s*(?:[a-zA-Z0-9]+|[+-]?\d+(?:\.\d+)?))*\s*$/;
      if (!regex.test(agregarPalabraInput.value)) {
        alert("Por favor, introduzca una lista de palabras separadas por comas y un espacio, por ejemplo: palabra, otra palabra");
        return;
      }
      const nuevasPalabras = agregarPalabraInput.value.split(',').map(palabra => palabra.trim());
      const palabrasUnicas = nuevasPalabras.filter((palabra, index, arr) => arr.indexOf(palabra) === index);
      const palabrasAgregadas = [];
      const palabrasYaExistentes = [];
      palabrasUnicas.forEach(palabra => {
        if (resaltarHilos.includes(palabra)) {
          palabrasYaExistentes.push(palabra);
        } else {
          // Si la palabra no existe en la lista, se agrega
          resaltarHilos.push(palabra);
          GM_setValue("resaltarHilos", resaltarHilos);
          palabrasAgregadas.push(palabra);
        }
      });
      if (palabrasAgregadas.length > 0) {
        const mensaje = `Se ${palabrasAgregadas.length > 1 ? "han" : "ha"} añadido ${palabrasAgregadas.length > 1 ? "las" : "la"} ${palabrasAgregadas.length > 1 ? "palabras" : "palabra"} ${palabrasAgregadas.join(", ")} a la lista de resaltar hilos`;
        alert(mensaje);
      }
      if (palabrasYaExistentes.length > 0) {
        const mensaje = `${palabrasYaExistentes.length > 1 ? "Las" : "La"} ${palabrasYaExistentes.length > 1 ? "palabras" : "palabra"} ${palabrasYaExistentes.join(", ")} ya ${palabrasYaExistentes.length > 1 ? "están" : "está"} en la lista de resaltar hilos`;
        alert(mensaje);
      }
      agregarPalabraInput.value = "";
});
    nuevaVentana.appendChild(agregarPalabraBtn);

// Crear el botón para eliminar palabras de resaltar hilos
const eliminarPalabraBtn = document.createElement("button");
    eliminarPalabraBtn.textContent = "Eliminar";
    eliminarPalabraBtn.style.cssText = "background-color: #FD5D4D; color: white; padding: 10px 20px; font-weight: bold; border-radius: 6px; cursor: pointer; margin-left: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);";
    eliminarPalabraBtn.addEventListener("click", () => {
      const palabraAEliminar = agregarPalabraInput.value.trim();
      if (palabraAEliminar) {
        const indice = resaltarHilos.indexOf(palabraAEliminar);
        if (indice !== -1) {
          resaltarHilos.splice(indice, 1);
          GM_setValue("resaltarHilos", resaltarHilos);
          alert(`La palabra "${palabraAEliminar}" A sido eliminada de la lista de resaltar.`);
        } else {
          alert(`La palabra "${palabraAEliminar}" NO se encontró en la lista de resaltar.`);
        }
        agregarPalabraInput.value = "";
      }
    });
    nuevaVentana.appendChild(eliminarPalabraBtn);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Crear contenedor para el área de ocultar hilos
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const ocultarHilosContainer = document.createElement("div");
    ocultarHilosContainer.style.cssText = "display: flex; align-items: center; margin-bottom: 10px;";
    nuevaVentana.appendChild(ocultarHilosContainer);

// Crear el título de la caja de ocultar hilos
const ocultarHilosTitulo = document.createElement("div");
    ocultarHilosTitulo.textContent = "Ocultar hilos (separado por comas)";
    ocultarHilosTitulo.style.cssText = "border: 5px solid #3A3A3A; color: white; margin-bottom: 20px; font-weight: bold; box-shadow: 0 2px 6px rgba(0, 0, 0, 1); border-radius: 6px; background-color: #3A3A3A;";
    nuevaVentana.appendChild(ocultarHilosTitulo);

// Crear el input para añadir palabras a ocultar
const ocultarHilosInput = document.createElement("input");
    ocultarHilosInput.placeholder = "Añadir palabra a ocultar";
    ocultarHilosInput.style.cssText = "padding: 8px 12px; border: 1px solid #FD5D4D; box-shadow: 0 2px 6px rgba(0, 0, 0, 1); border-radius: 5px; margin-right: 5px; margin-left: 5px;";
    nuevaVentana.appendChild(ocultarHilosInput);

// Crear el botón para añadir palabras a ocultar
const ocultarHilosBtn = document.createElement("button");
    ocultarHilosBtn.textContent = "Añadir";
    ocultarHilosBtn.style.cssText = "background-color: #32CD32; color: white; padding: 10px 20px; font-weight: bold; border-radius: 6px; cursor: pointer; margin-left: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);";
    ocultarHilosBtn.addEventListener("click", () => {
      const regex = /^\s*(?:[a-zA-Z0-9]+|[+-]?\d+(?:\.\d+)?)(?:\s*,\s*(?:[a-zA-Z0-9]+|[+-]?\d+(?:\.\d+)?))*\s*$/;
      if (!regex.test(ocultarHilosInput.value)) {
        alert("Por favor, introduzca una lista de palabras separadas por comas y un espacio, por ejemplo: palabra, otra palabra");
        return;
      }
      const nuevasPalabras1 = ocultarHilosInput.value.split(',').map(palabra => palabra.trim());
      const palabrasUnicas2 = nuevasPalabras1.filter((palabra, index, arr) => arr.indexOf(palabra) === index);
      const palabrasAgregadas1 = [];
      const palabrasYaExistentes2 = [];
      palabrasUnicas2.forEach(palabra => {
        if (ocultarHilos.includes(palabra)) {
          palabrasYaExistentes2.push(palabra);
        } else {
          // Si la palabra no existe en la lista, se agrega
          ocultarHilos.push(palabra);
          GM_setValue("ocultarHilos", ocultarHilos);
          palabrasAgregadas1.push(palabra);
        }
      });
      if (palabrasAgregadas1.length > 0) {
        const mensaje = `Se ${palabrasAgregadas1.length > 1 ? "han" : "ha"} añadido ${palabrasAgregadas1.length > 1 ? "las" : "la"} ${palabrasAgregadas1.length > 1 ? "palabras" : "palabra"} ${palabrasAgregadas1.join(', ')} a la lista de ocultar hilos`;
        alert(mensaje);
      }
      if (palabrasYaExistentes2.length > 0) {
        const mensaje = `${palabrasYaExistentes2.length > 1 ? "Las" : "La"} ${palabrasYaExistentes2.length > 1 ? "palabras" : "palabra"} ${palabrasYaExistentes2.join(', ')} ya ${palabrasYaExistentes2.length > 1 ? "estan" : "esta"} en la lista de ocultar hilos`;
        alert(mensaje);
      }
      ocultarHilosInput.value = "";
});
    nuevaVentana.appendChild(ocultarHilosBtn);

// Crear el botón para eliminar palabras de ocultarHilos
const eliminarPalabra2Btn = document.createElement("button");
    eliminarPalabra2Btn.textContent = "Eliminar";
    eliminarPalabra2Btn.style.cssText = "background-color: #FD5D4D; color: white; padding: 10px 20px; font-weight: bold; border-radius: 6px; cursor: pointer; margin-left: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);";
    eliminarPalabra2Btn.addEventListener("click", () => {
      const palabraAEliminar = ocultarHilosInput.value.trim();
      if (palabraAEliminar) {
        const indice = ocultarHilos.indexOf(palabraAEliminar);
        if (indice !== -1) {
          ocultarHilos.splice(indice, 1);
          GM_setValue("ocultarHilos", ocultarHilos);
          alert(`La palabra "${palabraAEliminar}" A sido eliminada de la lista ocultar hilos.`);
        } else {
          alert(`La palabra "${palabraAEliminar}" NO se encontró en la lista de ocultar hilos.`);
        }
        ocultarHilosInput.value = "";
      }
    });
    nuevaVentana.appendChild(eliminarPalabra2Btn);

// agregar el botón de cierre
let cerrarBtn = document.createElement("button");
    cerrarBtn.textContent = "Cerrar";
    cerrarBtn.style.cssText = "bottom: 20px; left: 50%; padding: 10px 20px; border-radius: 5px; border: none; background-color: #555; color: white; cursor: pointer; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5); display: block; margin: 0 auto; margin-top: 25px;";
    cerrarBtn.addEventListener("click", () => {
    // esperar un breve momento antes de aplicar el efecto de salida
    setTimeout(() => {
        nuevaVentana.style.transition = 'opacity 0.3s ease'; // Duración de la animación y tipo de efecto
        nuevaVentana.style.opacity = '0'; // Cambiar la opacidad a 0 para el efecto de salida
    }, 10);

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
}});

// escuchar eventos de clic en el botón de recuperar listas
recuperarListasBtn.addEventListener("click", () => {
  // verificar si hay una ventana emergente abierta
  if (!ventanaAbierta) {
    // establecer el estado de la ventana emergente en abierto
    ventanaAbierta = true;

    // crear un mensaje con las listas guardadas
    let mensajeResaltados = `${resaltarHilos}`;
    let mensajeOcultos = `${ocultarHilos}`;

    // Crear una nueva ventana emergente
    const nuevaVentana = document.createElement("div");
        nuevaVentana.classList.add("nuevaVentana"); // Agregar una clase para identificar la ventana emergente
        Object.assign(nuevaVentana.style, {position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", border: "5px solid #2A2A2A", borderRadius: "6px", boxShadow: "0 2px 6px rgba(0, 0, 0, 1)", backgroundColor: "#2A2A2A", zIndex: "9999", padding: "20px", textAlign: "center", opacity: "0"});
        document.body.appendChild(nuevaVentana);

    // Esperar un breve momento para aplicar el efecto de entrada
    setTimeout(() => {
      nuevaVentana.style.transition = 'opacity 0.3s ease'; // Duración de la animación y tipo de efecto
      nuevaVentana.style.opacity = '1'; // Cambiar la opacidad a 1 para el efecto de entrada
    }, 10);

  // agregar la caja de texto para hilos resaltados
  const resaltadosDiv = document.createElement("div");
      resaltadosDiv.style = "padding: 10px; color: white; max-height: none; max-width: 500px; font-weight: bold; overflow-y: auto; word-wrap: break-word; white-space: pre-wrap;";
      mensajeResaltados = mensajeResaltados.replace(/[\/]/g, '').replace(/,/g, ' <span style="font-weight: bold; color: #FC4E3F">|</span> '); // eliminar las barras "/" y caracteres raros
      resaltadosDiv.innerHTML = mensajeResaltados;
      nuevaVentana.appendChild(resaltadosDiv);

  // Agregar la caja de texto para hilos ocultos
  const ocultosDiv = document.createElement("div");
      ocultosDiv.style.cssText = "padding: 10px; color: white; max-height: none; max-width: 500px; font-weight: bold; overflow-y: auto; word-wrap: break-word; white-space: pre-wrap;";

  const mensajeOcultosLimpio = mensajeOcultos.replace(/\\b/g, "").replace(/\//g, '').replace(//g, '').replace(/,/g, ' <span style="font-weight: bold; color: #FC4E3F">|</span> ');
      ocultosDiv.innerHTML = mensajeOcultosLimpio;
      nuevaVentana.appendChild(ocultosDiv);

  // agregar texto descriptivo a cada caja de texto
  const resaltadosTitulo = document.createElement("div");
      resaltadosTitulo.style.cssText = "border: 5px solid #3A3A3A; margin-bottom: 20px; font-weight: bold; box-shadow: 0 2px 6px rgba(0, 0, 0, 1); border-radius: 6px; background-color: #3A3A3A;";
      resaltadosTitulo.textContent = "Hilos resaltados";
      resaltadosDiv.insertBefore(resaltadosTitulo, resaltadosDiv.firstChild);

  const ocultosTitulo = document.createElement("div");
      ocultosTitulo.style.cssText = "border: 5px solid #3A3A3A; margin-bottom: 20px; font-weight: bold; box-shadow: 0 2px 6px rgba(0, 0, 0, 1); border-radius: 6px; background-color: #3A3A3A;";
      ocultosTitulo.textContent = "Hilos ocultados";
      ocultosDiv.insertBefore(ocultosTitulo, ocultosDiv.firstChild);

  // agregar el botón de cierre
  let cerrarBtn = document.createElement("button");
      cerrarBtn.textContent = "Cerrar";
      cerrarBtn.style.cssText = "bottom: 20px; left: 50%; padding: 10px 20px; border-radius: 5px; margin-top: 10px; background-color: #555; color: white; cursor: pointer; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5)";
      cerrarBtn.addEventListener("click", () => {
      // esperar un breve momento antes de aplicar el efecto de salida
          setTimeout(() => {
              nuevaVentana.style.transition = 'opacity 0.3s ease'; // Duración de la animación y tipo de efecto
              nuevaVentana.style.opacity = '0'; // Cambiar la opacidad a 0 para el efecto de salida
          }, 10);
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
}});

// Función ocultar y resaltar hilos
  let elementos = document.querySelectorAll('section.without-bottom-corners > div');
  let elementosOcultos = [];

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

  elementos.forEach((elemento) => {
    if (!elemento.querySelector('[id*="thread_title_"]>span')) {
      return;
    }
    let texto = elemento.querySelector('[id*="thread_title_"]>span').innerText.toLowerCase();
    for (let i = 0; i < resaltarHilos.length; i++) {
      let regex = getRegex(resaltarHilos[i], false, true);
      if (regex.test(texto)) {
        elemento.style.cssText = "background: #3D3D3D; font-weight: bold;";
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
            titulo.innerHTML = titulo.innerHTML.replace(regexTitulo, `<span style="font-weight: bold; color: #FD5D4D;"> ${palabra}</span>`);
          });
      elemento.style.borderRadius = '5px';
      elemento.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.5)';
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
          spoiler.style.cssText = "background: #3A3A3A; color: #ffff; font-weight: bold; text-align: center; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5); padding: 10px; border-radius: 5px; cursor: pointer;";

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
