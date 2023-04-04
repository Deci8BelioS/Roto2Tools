// Buscar el elemento "#searchform-desktop"
const Roto2Tools = $("#searchform-desktop");

// Crear el botón para guardar las listas
const guardarlistasBtn = $("<button>").text("Guardar cambios")
    .css({ "background-color": "rgb(255, 90, 75)", color: "white", "font-weight": "bold", padding: "10px 20px", "border-radius": "6px", "text-shadow": "rgb(0, 0, 0) 1px 1px 4px", cursor: "pointer", "box-shadow": "rgba(0, 0, 0, 0.6) 0px 2px 4px", transition: "transform 0.3s, box-shadow 0.3s" })
    .on("mousedown", function () { $(this).css({ boxShadow: "none", transform: "translateY(3px)" }); })
    .on("mouseup", function () { $(this).css({ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.6)", transform: "none" }); })

var menuBtn = $("<button>")
    .html('Roto2Tools')
    .css({ "background-color": "#FF5A4B", color: "white", padding: "10px 20px", "font-weight": "bold", "text-shadow": "1px 1px 4px #000", "border-radius": "6px", cursor: "pointer", "margin-left": "5px", "box-shadow": "0px 2px 4px rgba(0, 0, 0, 0.6)", transition: "transform 0.3s, box-shadow 0.3s" })
    .on("mousedown", function () { $(this).css({ boxShadow: "none", transform: "translateY(3px)" }); })
    .on("mouseup", function () { $(this).css({ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.6)", transform: "none" }); });

// Inicializamos Tippy.js con el gatillo
tippy(menuBtn[0], {
    content: 'Haz clic para abrir las preferencias',
    animation: 'scale',
    interactive: true,
    placement: 'bottom', // La ubicación donde se mostrará Tippy
    arrow: true, // Mostrar una flecha en Tippy
});

// Insertar boton después del elemento "#searchform-desktop" si existe, de lo contrario no lo hará
if (Roto2Tools.length > 0) {
    Roto2Tools.after(menuBtn);
}

// Insertar boton después del elemento "#searchform-desktop" si existe, de lo contrario no lo hará
if (header.length > 0) {
    header.after(menuBtn);
}

var modalContent = $("<div>")
    .addClass('modal-content');

var modalHeader = $("<div>")
    .addClass('modal-header')
    .appendTo(modalContent);

var title = $("<h5>")
    .addClass("lead modal-title")
    .html('<img src="https://forocoches.com/foro/images/smilies/goofy.gif">&nbsp;Roto2Tools&nbsp;<img src="https://forocoches.com/foro/images/smilies/goofy.gif">')
    .appendTo(modalHeader);

// Crear las pestañas
var tabContent = $("<div>")
    .addClass("tab-content")

var tabPane1 = $("<div>")
    .addClass("tab-pane fade")
    .attr("id", "opcion1")

var tabContent1 = $("<div>")
    .addClass("tab-content")
    .appendTo(tabPane1)

var resaltarHilosInput = $("<textarea>")
    .addClass("form-control")
    .attr("placeholder", "Agregar palabras a resaltar separadas por comas, ejemplo: palabra, palabra")
    .css({ "min-height": "188px", "max-height": "320px" })
    .val(resaltarHilos.join(", "))
    .appendTo(resaltarHilosInput);

// Contenido
var tabPane2 = $("<div>")
    .addClass("tab-pane fade")
    .attr("id", "opcion2")

var tabContent2 = $("<div>")
    .addClass("tab-content")
    .appendTo(tabPane2)

const ocultarInput = $("<textarea>")
    .addClass("form-control")
    .attr("placeholder", "Agregar palabras a ocultar separadas por comas, ejemplo: palabra, palabra")
    .css({ "min-height": "188px", "max-height": "320px" })
    .val(ocultarHilos.join(", "))
    .appendTo(ocultarInput);

var tabPane3 = $("<div>")
    .addClass("tab-pane fade")
    .attr("id", "opcion3")

var tabContent3 = $("<div>")
    .addClass("tab-content")
    .appendTo(tabPane3)

const ocultarContactosInput = $("<textarea>")
    .addClass("form-control")
    .attr("placeholder", "Agregar usuarios para ocultar sus hilos separados por comas (sin el @), ejemplo: Pepe palotes, iliti")
    .css({ "min-height": "188px", "max-height": "320px" })
    .val(ocultarContactos.join(", "))
    .appendTo(ocultarContactosInput);

var tabPane4 = $("<div>")
    .addClass("tab-pane fade")
    .attr("id", "opcion4")
var tabContent4 = $("<div>")
    .addClass("tab-content")
    .appendTo(tabPane4);

const resaltarMensajesContactosInput = $("<textarea>")
    .addClass("form-control")
    .attr("placeholder", "Agregar usuarios para resaltar sus mensajes en los hilos separados por comas (sin el @), ejemplo: Pepe palotes, iliti")
    .css({ "min-height": "188px", "max-height": "320px" })
    .val(resaltarContactos.join(", "))
    .appendTo(resaltarMensajesContactosInput);

var tabPane5 = $("<div>")
    .addClass("tab-pane fade")
    .attr("id", "opcion5")
var tabContent5 = $("<div>")
    .addClass("tab-about")
    .appendTo(tabPane5);

const acercaRoto2Tools = $("<div>")
    .addClass("form-control")
    .html("Aquí puedes agregar la información que quieras mostrar en la pestaña.")
    .appendTo(acercaRoto2Tools);

var tabContent = $("<div>")
    .addClass("tab-content")
    .append(tabPane1, tabPane2, tabPane3, tabPane4, tabPane5);

var tabList = $("<ul>")
    .addClass("nav nav-tabs")
    .attr("id", "myTab")
    .attr("role", "tablist")
    .append($("<li>")
        .addClass("nav-item")
        .append($("<a>")
            .addClass("nav-link")
            .attr("id", "opcion1-tab")
            .attr("data-bs-toggle", "tab")
            .attr("href", "#opcion1")
            .attr("role", "tab")
            .attr("aria-controls", "opcion1")
            .attr("aria-selected", "true")
            .html("Resaltar hilos")
        )
    )
    .append($("<li>").addClass("nav-item")
        .append($("<a>")
            .addClass("nav-link")
            .attr("id", "opcion2-tab")
            .attr("data-bs-toggle", "tab")
            .attr("href", "#opcion2")
            .attr("role", "tab")
            .attr("aria-controls", "opcion2")
            .attr("aria-selected", "false")
            .html("Ocultar hilos")
        )
    )
    .append($("<li>").addClass("nav-item")
        .append($("<a>")
            .addClass("nav-link")
            .attr("id", "opcion3-tab")
            .attr("data-bs-toggle", "tab")
            .attr("href", "#opcion3")
            .attr("role", "tab")
            .attr("aria-controls", "opcion3")
            .attr("aria-selected", "false")
            .html("Ocultar usuarios")
        )
    )
    .append($("<li>")
        .addClass("nav-item")
        .append($("<a>")
            .addClass("nav-link")
            .attr("id", "opcion4-tab")
            .attr("data-bs-toggle", "tab")
            .attr("href", "#opcion4")
            .attr("role", "tab")
            .attr("aria-controls", "opcion4")
            .attr("aria-selected", "false")
            .html("Resaltar usuarios")
        )
    )
    .append($("<li>")
        .addClass("nav-item")
        .append($("<a>")
            .addClass("nav-link")
            .attr("id", "opcion5-tab")
            .attr("data-bs-toggle", "tab")
            .attr("href", "#opcion5")
            .attr("role", "tab")
            .attr("aria-controls", "opcion4")
            .attr("aria-selected", "false")
            .html("Acerca de Roto2Tools")
        )
    );

var modalContent = $("<div>")
    .addClass("modal-content")

    .append($("<div>")
        .addClass("modal-body")
        .append(tabList)
        .append(tabContent)
    )
    .append($("<div>")
        .addClass("modal-footer")
        .append(guardarlistasBtn)
        .attr("type", "button")
        .attr("data-bs-dismiss", "modal")
    )
    .append($("<div>")
        .addClass("modal-footer")
        .append($("<button>")
            .attr("type", "button")
            .attr("data-bs-dismiss", "modal")
            .html("Cerrar")
            .css({
                bottom: "20px",
                padding: "10px 20px",
                "border-radius": "6px",
                "text-shadow": "rgb(0, 0, 0) 1px 1px 4px",
                "background-color": "rgb(85, 85, 85)",
                color: "white",
                cursor: "pointer",
                "box-shadow": "rgba(0, 0, 0, 0.6) 0px 2px 4px",
                transition: "transform 0.3s, box-shadow 0.3s"
            })
            .on("mousedown", function () {
                $(this).css({
                    boxShadow: "none",
                    transform: "translateY(3px)"
                })
            })
            .on("mouseup", function () {
                $(this).css({
                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.6)",
                    transform: "none"
                })
            })
        )
    )

var modal = $("<div>").addClass("modal fade")
    .attr("tabindex", "-1")
    .attr("role", "dialog")
    .append($("<div>").addClass("modal-dialog modal-dialog")
        .css({ "max-width": "40%", "max-height": "40%" })
        .attr("role", "document")
        .append(modalContent)
    );

$("body").append(modal);

guardarlistasBtn.on("click", function () {

    const OcultarListaInput = $(ocultarInput).val().trim();
    const resaltarListaInput = $(resaltarHilosInput).val().trim();
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
        resaltarHilosInput.value = GM_getValue("resaltarHilos", []).join(", ");
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
    placement: 'bottom', // La ubicación donde se mostrará Tippy
    arrow: true, // Mostrar una flecha en Tippy
});

menuBtn.on('click', function () {
    var myModal = new bootstrap.Modal(modal[0]);
    myModal.show();
});
