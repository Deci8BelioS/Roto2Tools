
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

};
