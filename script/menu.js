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

// Insertar boton después del elemento "#searchform-desktop" si existe, de lo contrario no lo hará
if (Roto2Tools.length > 0) {
  Roto2Tools.after(menuBtn);
}

var modalContent = $("<div>")
  .addClass('modal-content')

var modalHeader = $("<div>")
  .addClass('modal-header')
  .appendTo(modalContent)

// Crear las pestañas
var tabContent = $("<div>")
  .addClass("tab-content")

var tabPane1 = $("<div>")
  .addClass("tab-pane active")
  .attr("id", "opcion1")

var tabContent1 = $("<div>")
  .addClass("tab-content")
  .appendTo(tabPane1)

var resaltarHilosInput = $("<textarea>")
  .addClass("form-control")
  .attr("placeholder", "Agregar palabras a resaltar separadas por comas, ejemplo: palabra, palabra")
  .css({ "box-shadow": "rgba(0, 0, 0, 0.6) 0px 2px 6px", "margin-top": "10px" })
  .val(resaltarHilos.join(", "))
  .appendTo(tabContent1);

var tabPane2 = $("<div>")
  .addClass("tab-pane fade")
  .attr("id", "opcion2")

var tabContent2 = $("<div>")
  .addClass("tab-content")
  .appendTo(tabPane2)

const ocultarInput = $("<textarea>")
  .addClass("form-control")
  .attr("placeholder", "Agregar palabras a ocultar separadas por comas, ejemplo: palabra, palabra")
  .css({ "box-shadow": "rgba(0, 0, 0, 0.6) 0px 2px 6px", "margin-top": "10px" })
  .val(ocultarHilos.join(", "))
  .appendTo(tabContent2);

var tabPane3 = $("<div>")
  .addClass("tab-pane fade")
  .attr("id", "opcion3")

var tabContent3 = $("<div>")
  .addClass("tab-content")
  .appendTo(tabPane3)

const ocultarContactosInput = $("<textarea>")
  .addClass("form-control")
  .attr("placeholder", "Agregar usuarios para ocultar sus hilos separados por comas (sin el @), ejemplo: Pepe palotes, iliti")
  .css({ "box-shadow": "rgba(0, 0, 0, 0.6) 0px 2px 6px", "margin-top": "10px" })
  .val(ocultarContactos.join(", "))
  .appendTo(tabContent3);

var tabPane4 = $("<div>")
  .addClass("tab-pane fade")
  .attr("id", "opcion4")

var tabContent4 = $("<div>")
  .addClass("tab-content")
  .appendTo(tabPane4);

const resaltarMensajesContactosInput = $("<textarea>")
  .addClass("form-control")
  .attr("placeholder", "Agregar usuarios para resaltar sus mensajes en los hilos separados por comas (sin el @), ejemplo: Pepe palotes, iliti")
  .css({ "box-shadow": "rgba(0, 0, 0, 0.6) 0px 2px 6px", "margin-top": "10px" })
  .val(resaltarContactos.join(", "))
  .appendTo(tabContent4);

var tabPane5 = $("<div>")
  .addClass("tab-pane fade")
  .attr("id", "opcion5")

var tabContent5 = $("<div>")
  .addClass("tab-content")
  .appendTo(tabPane5);

const acercaRoto2Tools = $("<div>")
  .addClass("tab-about")
  .html('<div style="text-align: center;">\
  <p>Script para Forocoches que oculta hilos o los resalta con las palabras añadidas por el usuario</p>\
  <div style="text-align: right;">\
    <strong><a href="https://github.com/Deci8BelioS/Roto2Tools/" target="_blank">Github Roto2Tools</a></strong>\
    <br>\
    <span><strong>Versión instalada:</strong> 1.5.0b</span>\
  </div>\
</div>')
  .css({ "color": "#fff", "margin-top": "10px" })
  .appendTo(tabContent5);

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
      .addClass("nav-link active")
      .attr("id", "opcion1-tab")
      .attr("data-bs-toggle", "tab")
      .attr("href", "#opcion1")
      .attr("role", "tab")
      .attr("aria-controls", "opcion1")
      .attr("aria-selected", "true")
      .html("Resaltar hilos")
      .css({
        "color": "rgb(237, 212, 14)",
        "font-weight": "bold",
        "text-align": "center"
      })
      .hover(function () {
        $(this).css("background-color", "rgba(237, 212, 14, 0.1)")
      }, function () {
        $(this).css("background-color", "")
      })
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
      .css({
        "color": "rgb(253, 93, 77)",
        "font-weight": "bold",
        "text-align": "center"
      })
      .hover(function () {
        $(this).css("background-color", "rgba(253, 93, 77, 0.1)");
      }, function () {
        $(this).css("background-color", "")
      })
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
      .css({
        "color": "rgb(255, 38, 38)",
        "font-weight": "bold",
        "text-align": "center"
      })
      .hover(function () {
        $(this).css("background-color", "rgba(255, 38, 38, 0.1)");
      }, function () {
        $(this).css("background-color", "")
      })
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
      .css({
        "color": "rgb(47, 199, 38)",
        "font-weight": "bold",
        "text-align": "center"
      })
      .hover(function () {
        $(this).css("background-color", "rgba(47, 199, 38, 0.1)")
      }, function () {
        $(this).css("background-color", "")
      })
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
      .css({
        "color": "rgb(255, 255, 255)",
        "font-weight": "bold",
        "text-align": "center"
      })
      .hover(function () {
        $(this).css("background-color", "rgba(255, 255, 255, 0.1)")
      }, function () {
        $(this).css("background-color", "")
      })
    )
  )

var modalContent = $("<div>")
  .addClass("modal-content")
  .css({
    "box-shadow": "rgba(0, 0, 0, 0.6) 0px 2px 4px",
    "overflow": "auto"
  })
  .append($("<div>")
    .addClass("modal-header")
    .append($("<h2>")
      .addClass("modal-title")
      .html('<img src="https://forocoches.com/foro/images/smilies/goofy.gif"> Roto2Tools <img src="https://forocoches.com/foro/images/smilies/goofy.gif">')
      .css({
        "text-align": "center",
        "display": "block",
        "margin": "0 auto"
      })
    )
  )
  .append($("<div>")
    .addClass("modal-body")
    .append(tabList)
    .append(tabContent)
  )
  .append($("<div>")
    .addClass("modal-footer")
    .append($(guardarlistasBtn)
      .attr("type", "button")
      .attr("data-bs-dismiss", "modal")
    )
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

var modal = $("<div>")
  .addClass("modal fade")
  .attr("tabindex", "-1")
  .attr("role", "dialog")
  .append($("<div>")
    .addClass("modal-dialog modal-dialog")
    .css({
      "max-width": "auto",
      "max-height": "auto"
    })
    .attr("role",
      "document")
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
  }
});

// Tippy.js guardarlistasBtn
tippy(guardarlistasBtn[0], {
  content: 'Haz clic para guardar las listas',
  animation: 'scale',
  interactive: true,
  placement: 'bottom', // La ubicación donde se mostrará Tippy
  arrow: true, // Mostrar una flecha en Tippy
});

// Tippy.js menuBtn
tippy(menuBtn[0], {
  content: 'Haz clic para abrir las preferencias',
  animation: 'scale',
  interactive: true,
  placement: 'bottom', // La ubicación donde se mostrará Tippy
  arrow: true, // Mostrar una flecha en Tippy
});

menuBtn.on('click', function () {
  var myModal = new bootstrap.Modal(modal[0]);
  myModal.show();
});
