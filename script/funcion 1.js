
// Función ocultar y resaltar hilos
let elementos = document.querySelectorAll('section.without-bottom-corners > div');
let elementosOcultos = [];

elementos.forEach((el) => {
    if (!el.querySelector('[id*="thread_title_"]>span')) {
        return;
    }
    let title = el.querySelector('.without-top-corners > div > div > div > div > [href^="showthread.php"]');
    let textTitle = title ? title.innerText.toLowerCase() : '';

    if (ocultarContactos.some((palabra) => {
        let regex = getRegex(palabra, false, true);
        return regex.test(textTitle);
    })) {
        elementosOcultos.push(el)
        el.remove()
        ocultarContactos.forEach((palabra) => {
            let regex = getRegex(palabra, false, true);
            let regexTitulo = new RegExp(regex.source, "ig");
            el.style.cssText = "background: #541818;";
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

elementos.forEach((el2) => {
    if (!el2.querySelector('[id*="thread_title_"]>span')) {
        return;
    }
    let title = el2.querySelector('.without-top-corners > div > div > div > div > [href^="showthread.php"]');
    let textTitle = title ? title.innerText.toLowerCase() : '';

    if (resaltarContactos.some((palabra) => {
        let regex = getRegex(palabra, false, true);
        return regex.test(textTitle);
    })) {
        resaltarContactos.forEach((palabra) => {
            let regex = getRegex(palabra, false, true);
            let regexTitulo = new RegExp(regex.source, "ig");
            el2.style.cssText = "background: #003A00; text-shadow: 1px 1px 4px #000;";
            title.innerHTML = `{ color: #A4A4A4 !important; }`;
            el2.querySelector('[id*="thread_title_"]>span').style.color = '#ffffff';
            let titulo = el2.querySelector('a[href^="showthread.php?p="]');
            let span = document.createElement('span');
            let index = textTitle.indexOf('@');
            let nick = textTitle.substring(index, textTitle.indexOf('-', index)).trim();
            let resto = textTitle.substring(nick.length + 1);
            span.innerHTML = '<span style="color: #2FC726; font-weight: bold; font-size: 0.75rem; text-shadow: 1px 1px 4px #000;">' + nick + '</span>&nbsp;<span style="color: var(--gray-text); font-size: 0.75rem;">' + resto + '</span>';
            titulo.parentNode.insertBefore(span, titulo);
            titulo.remove();
        });

        el2.style.borderRadius = '5px';
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
    let elementoscontactos = document.querySelectorAll(`[id*="postmenu_"] h2:not(.resaltado)`);
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
        let postmenuElem = editcontacto.querySelector(':scope [id*="postmenu_"] h2:not(.oculto)');
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
