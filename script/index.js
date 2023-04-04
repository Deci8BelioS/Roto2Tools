
// Cargar y agregar el archivo CSS como recurso y estilo en la página
const bootstrapcss = GM_getResourceText('bootstrapcss');
GM_addStyle(bootstrapcss);

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
    
