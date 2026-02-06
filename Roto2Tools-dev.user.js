// ==UserScript==
// @id              Roto2Tools DEV
// @name            Roto2Tools DEV
// @namespace       Roto2Tools DEV
// @author          DeciBelioS
// @homepage        https://github.com/Deci8BelioS/Roto2Tools/
// @description     Script para Forocoches que oculta hilos o los resalta con las palabras añadidas por el usuario
// @icon            https://raw.githubusercontent.com/Deci8BelioS/Roto2Tools/dev/resources/img/icon-48x48.png
// @icon64          https://raw.githubusercontent.com/Deci8BelioS/Roto2Tools/dev/resources/img/icon-64x64.png
// @updateURL       https://github.com/Deci8BelioS/Roto2Tools/raw/refs/heads/dev-1/Roto2Tools-dev.user.js
// @version         1.7.0d
// @encoding        UTF-8
// @match           *://www.forocoches.com/*
// @match           *://forocoches.com/*
// @grant           GM_setValue
// @grant           GM_getValue
// @grant           GM_deleteValue
// @grant           GM_xmlhttpRequest
// @grant           GM_addStyle
// @grant           GM_getMetadata
// @run-at          document-end
// @require         https://code.jquery.com/jquery-3.7.1.min.js
// @require         https://cdn.jsdelivr.net/npm/bootstrap@5/dist/js/bootstrap.min.js
// @require         https://raw.githubusercontent.com/Deci8BelioS/Roto2Tools/dev/resources/require/toastr.js
// @require         https://unpkg.com/@popperjs/core@2
// @require         https://unpkg.com/tippy.js@6
// --- Modulos Roto2Tools ---
// @require         https://github.com/Deci8BelioS/Roto2Tools/raw/refs/heads/dev-1/script/utils.js
// @require         https://github.com/Deci8BelioS/Roto2Tools/raw/refs/heads/dev-1/script/menu.js
// @require         https://github.com/Deci8BelioS/Roto2Tools/raw/refs/heads/dev-1/script/processing.js
// ==/UserScript==
(function() {
    'use strict';
    function addGlobalStyle(href) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = href;
        document.head.appendChild(link);
    }
    try {
        addGlobalStyle('https://unpkg.com/tippy.js@6/dist/tippy.css');
        addGlobalStyle('https://unpkg.com/tippy.js@6/animations/scale.css');
        addGlobalStyle('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css');
        const bootstrapcss = `
        .dd-menu .dropdown-menu-bg{box-shadow:rgba(0,0,0,.6) 0 2px 4px;background-color:rgb(21 21 21 / 60%);border:1px solid rgb(255 255 255 / 20%);border-top:none;color:#fff!important;backdrop-filter:blur(5px);text-shadow:0 2px 4px #000}.dd-menu .menu-item{color:#fff!important;text-shadow:0 2px 4px #000}body{--secondary:#ff5845}p{transition:var(--transition);font-size:.875rem;color:#fff}ol,ul{padding-left:2rem}dl,ol,ul{margin-top:0;margin-bottom:1rem}ol ol,ol ul,ul ol,ul ul{margin-bottom:0}b,strong{font-weight:bolder}a{color:#ff5845}a:visited,body_avisited{color:#ff5845;text-decoration:none}a:hover{color:#589cfc}a:not([href]):not([class]),a:not([href]):not([class]):hover{color:inherit;text-decoration:none}a>code{color:inherit}table{caption-side:bottom;border-collapse:collapse}button{border-radius:0}button:focus:not(:focus-visible){outline:0}button,input,optgroup,select,textarea{margin:0;font-family:inherit;font-size:inherit;line-height:inherit}button,select{text-transform:none}[role=button]{cursor:pointer}[type=button],[type=reset],[type=submit],button{-webkit-appearance:button;appearance:button}[type=button]:not(:disabled),[type=reset]:not(:disabled),[type=submit]:not(:disabled),button:not(:disabled){cursor:pointer}::-moz-focus-inner{padding:0;border-style:none}textarea{resize:vertical}.container,.container-fluid,.container-lg,.container-md,.container-sm,.container-xl,.container-xxl{width:100%;padding-right:var(--bs-gutter-x,.75rem);padding-left:var(--bs-gutter-x,.75rem);margin-right:auto;margin-left:auto}@media (min-width:576px){.container,.container-sm{max-width:540px}}@media (min-width:768px){.container,.container-md,.container-sm{max-width:720px}}@media (min-width:992px){.container,.container-lg,.container-md,.container-sm{max-width:960px}}@media (min-width:1200px){.container,.container-lg,.container-md,.container-sm,.container-xl{max-width:1140px}}@media (min-width:1400px){.container,.container-lg,.container-md,.container-sm,.container-xl,.container-xxl{max-width:1320px}}.form-control{display:block;width:100%;padding:.375rem .75rem;font-size:1rem;font-weight:400;line-height:1.5;color:#fff;background-color:rgb(42 42 42 / 60%);backdrop-filter:blur(5px);background-clip:padding-box;border:1px solid rgb(212 212 212 / 20%);-moz-appearance:none;appearance:none;border-radius:10px;transition:border-color .15s ease-in-out,box-shadow .15s ease-in-out,box-shadow .15s ease-in-out}@media (prefers-reduced-motion:reduce){.form-control{transition:none}}.form-control[type=file]{overflow:hidden}.form-control[type=file]:not(:disabled):not([readonly]){cursor:pointer}.form-control:focus{background-color:rgb(58 58 58 / 60%);color:#fff;border-color:rgb(253 93 77 / 60%);outline:0}.form-control::-webkit-date-and-time-value{height:1.5em}.form-control::-moz-placeholder{color:#b5b5b5;opacity:1}.form-control::placeholder{color:#b5b5b5;opacity:1}.form-control:disabled,.form-control[readonly]{background-color:#e9ecef;opacity:1}.form-control-plaintext{display:block;width:100%;padding:.375rem 0;margin-bottom:0;line-height:1.5;color:#212529;background-color:transparent;border:solid transparent;border-width:1px 0}.form-control-plaintext.form-control-lg,.form-control-plaintext.form-control-sm{padding-right:0;padding-left:0}textarea.form-control{font-weight:700;text-shadow:rgb(0 0 0 / 60%) 0 2px 6px;min-height:233px;max-height:500px}.fade{transition:opacity .15s linear}@media (prefers-reduced-motion:reduce){.fade{transition:none}}.fade:not(.show){opacity:0}.collapse:not(.show){display:none}.collapsing{height:0;overflow:hidden;transition:height .35s ease}@media (prefers-reduced-motion:reduce){.collapsing{transition:none}}.collapsing.collapse-horizontal{width:0;height:auto;transition:width .35s ease}@media (prefers-reduced-motion:reduce){.collapsing.collapse-horizontal{transition:none}}.nav{display:flex;padding-left:0;margin-bottom:0;list-style:none}.nav-link{display:block;padding:.5rem 1rem;text-decoration:none;transition:color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out}@media (prefers-reduced-motion:reduce){.nav-link{transition:none}}.nav-link:focus,.nav-link:hover{color:#fd5d4d}.nav-tabs{border-bottom:1px solid rgb(255 255 255 / 50%)}.nav-tabs .nav-link{margin-bottom:-1px;border-top-left-radius:.25rem;border-top-right-radius:.25rem;text-shadow:0 2px 4px #000}.tab-content>.tab-pane{display:none}.tab-content>.active{display:block}.modal{position:fixed;top:0;left:0;z-index:1055;display:none;width:100%;height:100%;overflow-x:hidden;overflow-y:auto;outline:0}.modal-dialog{position:relative;width:auto;margin:.5rem;pointer-events:none}.modal.fade .modal-dialog{transition:transform .3s ease-out;transform:translate(0,-50px)}@media (prefers-reduced-motion:reduce){.modal.fade .modal-dialog{transition:none}}.modal.show .modal-dialog{transform:none}.modal-dialog-centered{display:flex;align-items:center;min-height:calc(100% - 1rem)}.modal-content{position:relative;display:flex;flex-direction:column;width:100%;pointer-events:auto;background-color:rgb(42 42 42 / 60%);border:1px solid rgb(255 255 255 / 20%);border-radius:.8rem;outline:0;backdrop-filter:blur(5px)}.modal-header{display:flex;flex-shrink:0;align-items:center;justify-content:space-between;padding:.75rem;border-bottom:1px solid rgb(255 255 255 / 50%)}.modal-title{margin-bottom:0;line-height:1.5;color:#fff;text-shadow:0 2px 4px #000}.modal-body{position:relative;flex:1 auto;padding:.8rem;text-shadow:0 2px 4px #000}.modal-footer{display:flex;flex-wrap:wrap;flex-shrink:0;align-items:center;justify-content:flex-end;padding:.75rem;border-top:1px solid rgb(255 255 255 / 50%)}.modal-footer>*{margin:.25rem}@media (min-width:576px){.modal-dialog{max-width:600px;margin:1.75rem auto}}@media (min-width:992px){.modal-lg,.modal-xl{max-width:800px}}
        `;
        GM_addStyle(bootstrapcss);
        const toastrcss = `
        .toast-title{font-weight:700}.toast-message{-ms-word-wrap:break-word;word-wrap:break-word}.toast-message a,.toast-message label{color:#fff}.toast-message a:hover{color:#ccc;text-decoration:none}.toast-close-button{position:relative;right:-.3em;top:-.3em;float:right;font-size:20px;font-weight:700;color:#fff;-webkit-text-shadow:0 1px 0 #fff;text-shadow:0 1px 0 #fff;opacity:1;line-height:1}.toast-close-button:focus,.toast-close-button:hover{color:#000;text-decoration:none;cursor:pointer;opacity:.4}.rtl .toast-close-button{left:-.3em;float:left;right:.3em}button.toast-close-button{padding:0;cursor:pointer;background:0 0;border:0;-webkit-appearance:none;appearance:none}.toast-top-center{top:0;right:0;width:100%}.toast-bottom-center{bottom:0;right:0;width:100%}.toast-top-full-width{top:0;right:0;width:100%}.toast-bottom-full-width{bottom:0;right:0;width:100%}.toast-top-left{top:12px;left:12px}.toast-top-right{top:12px;right:12px}.toast-bottom-right{right:12px;bottom:12px}.toast-bottom-left{bottom:12px;left:12px}#toast-container{position:fixed;z-index:999999;pointer-events:none}#toast-container *{-moz-box-sizing:border-box;-webkit-box-sizing:border-box;box-sizing:border-box}#toast-container>div{position:relative;pointer-events:auto;overflow:hidden;margin:0 0 6px;padding:15px 15px 15px 50px;width:300px;-moz-border-radius:3px;-webkit-border-radius:3px;border-radius:3px;background-position:15px center;background-repeat:no-repeat;-moz-box-shadow:0 0 12px #999;-webkit-box-shadow:0 0 12px #999;box-shadow:0 0 12px #999;color:#fff;text-shadow:1px 1px 4px #000;opacity:1}#toast-container>div.rtl{direction:rtl;padding:15px 50px 15px 15px;background-position:right 15px center}#toast-container>div:hover{-moz-box-shadow:0 0 12px #000;-webkit-box-shadow:0 0 12px #000;box-shadow:0 0 12px #000;opacity:1;cursor:pointer}#toast-container>.toast-info{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGwSURBVEhLtZa9SgNBEMc9sUxxRcoUKSzSWIhXpFMhhYWFhaBg4yPYiWCXZxBLERsLRS3EQkEfwCKdjWJAwSKCgoKCcudv4O5YLrt7EzgXhiU3/4+b2ckmwVjJSpKkQ6wAi4gwhT+z3wRBcEz0yjSseUTrcRyfsHsXmD0AmbHOC9Ii8VImnuXBPglHpQ5wwSVM7sNnTG7Za4JwDdCjxyAiH3nyA2mtaTJufiDZ5dCaqlItILh1NHatfN5skvjx9Z38m69CgzuXmZgVrPIGE763Jx9qKsRozWYw6xOHdER+nn2KkO+Bb+UV5CBN6WC6QtBgbRVozrahAbmm6HtUsgtPC19tFdxXZYBOfkbmFJ1VaHA1VAHjd0pp70oTZzvR+EVrx2Ygfdsq6eu55BHYR8hlcki+n+kERUFG8BrA0BwjeAv2M8WLQBtcy+SD6fNsmnB3AlBLrgTtVW1c2QN4bVWLATaIS60J2Du5y1TiJgjSBvFVZgTmwCU+dAZFoPxGEEs8nyHC9Bwe2GvEJv2WXZb0vjdyFT4Cxk3e/kIqlOGoVLwwPevpYHT+00T+hWwXDf4AJAOUqWcDhbwAAAAASUVORK5CYII=)!important}#toast-container>.toast-error{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAHOSURBVEhLrZa/SgNBEMZzh0WKCClSCKaIYOED+AAKeQQLG8HWztLCImBrYadgIdY+gIKNYkBFSwu7CAoqCgkkoGBI/E28PdbLZmeDLgzZzcx83/zZ2SSXC1j9fr+I1Hq93g2yxH4iwM1vkoBWAdxCmpzTxfkN2RcyZNaHFIkSo10+8kgxkXIURV5HGxTmFuc75B2RfQkpxHG8aAgaAFa0tAHqYFfQ7Iwe2yhODk8+J4C7yAoRTWI3w/4klGRgR4lO7Rpn9+gvMyWp+uxFh8+H+ARlgN1nJuJuQAYvNkEnwGFck18Er4q3egEc/oO+mhLdKgRyhdNFiacC0rlOCbhNVz4H9FnAYgDBvU3QIioZlJFLJtsoHYRDfiZoUyIxqCtRpVlANq0EU4dApjrtgezPFad5S19Wgjkc0hNVnuF4HjVA6C7QrSIbylB+oZe3aHgBsqlNqKYH48jXyJKMuAbiyVJ8KzaB3eRc0pg9VwQ4niFryI68qiOi3AbjwdsfnAtk0bCjTLJKr6mrD9g8iq/S/B81hguOMlQTnVyG40wAcjnmgsCNESDrjme7wfftP4P7SP4N3CJZdvzoNyGq2c/HWOXJGsvVg+RA/k2MC/wN6I2YA2Pt8GkAAAAASUVORK5CYII=)!important}#toast-container>.toast-success{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADsSURBVEhLY2AYBfQMgf///3P8+/evAIgvA/FsIF+BavYDDWMBGroaSMMBiE8VC7AZDrIFaMFnii3AZTjUgsUUWUDA8OdAH6iQbQEhw4HyGsPEcKBXBIC4ARhex4G4BsjmweU1soIFaGg/WtoFZRIZdEvIMhxkCCjXIVsATV6gFGACs4Rsw0EGgIIH3QJYJgHSARQZDrWAB+jawzgs+Q2UO49D7jnRSRGoEFRILcdmEMWGI0cm0JJ2QpYA1RDvcmzJEWhABhD/pqrL0S0CWuABKgnRki9lLseS7g2AlqwHWQSKH4oKLrILpRGhEQCw2LiRUIa4lwAAAABJRU5ErkJggg==)!important}#toast-container>.toast-warning{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGYSURBVEhL5ZSvTsNQFMbXZGICMYGYmJhAQIJAICYQPAACiSDB8AiICQQJT4CqQEwgJvYASAQCiZiYmJhAIBATCARJy+9rTsldd8sKu1M0+dLb057v6/lbq/2rK0mS/TRNj9cWNAKPYIJII7gIxCcQ51cvqID+GIEX8ASG4B1bK5gIZFeQfoJdEXOfgX4QAQg7kH2A65yQ87lyxb27sggkAzAuFhbbg1K2kgCkB1bVwyIR9m2L7PRPIhDUIXgGtyKw575yz3lTNs6X4JXnjV+LKM/m3MydnTbtOKIjtz6VhCBq4vSm3ncdrD2lk0VgUXSVKjVDJXJzijW1RQdsU7F77He8u68koNZTz8Oz5yGa6J3H3lZ0xYgXBK2QymlWWA+RWnYhskLBv2vmE+hBMCtbA7KX5drWyRT/2JsqZ2IvfB9Y4bWDNMFbJRFmC9E74SoS0CqulwjkC0+5bpcV1CZ8NMej4pjy0U+doDQsGyo1hzVJttIjhQ7GnBtRFN1UarUlH8F3xict+HY07rEzoUGPlWcjRFRr4/gChZgc3ZL2d8oAAAAASUVORK5CYII=)!important}#toast-container.toast-bottom-center>div,#toast-container.toast-top-center>div{width:300px;margin-left:auto;margin-right:auto}#toast-container.toast-bottom-full-width>div,#toast-container.toast-top-full-width>div{width:96%;margin-left:auto;margin-right:auto}.toast{background-color:#030303}.toast-success{background-color:#51a351}.toast-error{background-color:#bd362f}.toast-info{background-color:#2f96b4}.toast-warning{background-color:#f89406}.toast-progress{position:absolute;left:0;bottom:0;height:4px;background-color:#000;opacity:.4}
        `;
        GM_addStyle(toastrcss);
        const Roto2Toolscss = `
        .rt2-main-button{background-color:#ff5a4b;color:#fff;padding:10px 20px;font-weight:700;text-shadow:1px 1px 4px #000;border-radius:6px;cursor:pointer;margin-left:5px;box-shadow:0 2px 4px #000;transition:transform .3s,box-shadow .3s;border:none}
        .roto2tools-modal-content{background-color:rgba(20,20,22,.8);backdrop-filter:blur(15px) saturate(150%);-webkit-backdrop-filter:blur(15px) saturate(150%);border:1px solid rgba(255,255,255,.1);box-shadow:0 8px 32px 0 rgba(0,0,0,.5);border-radius:12px;color:#f0f0f0;overflow:hidden}.modal-dialog.modal-xl{max-width:1000px;transition:max-width .3s ease-in-out}.modal-header{border-bottom:1px solid rgba(255,255,255,.1)}.modal-footer{border-top:1px solid rgba(255,255,255,.1)}.modal-body{padding:0}.modal-title{font-weight:700}
        .roto2tools-main-layout{display:flex;min-height:60vh}
        .roto2tools-nav{width:230px;flex-shrink:0;background-color:rgba(0,0,0,.2);padding:15px 0;border-right:1px solid rgba(255,255,255,.1);display:flex;flex-direction:column;transition:width .3s ease-in-out}
        .roto2tools-nav-link{display:flex;background:transparent;align-items:center;gap:15px;padding:12px 20px;color:#ccc;text-decoration:none;font-weight:500;border-left:4px solid transparent;transition:all .2s ease-in-out;white-space:nowrap;overflow:hidden}
        .roto2tools-nav-link:hover{background-color:rgba(255,255,255,.05);color:#fff}
        .roto2tools-nav-link.active{background-color:rgba(88,156,252,.1);color:#fff;font-weight:700;border-left:4px solid #589cfc}
        .roto2tools-nav-link i{width:20px;text-align:center;font-size:1.1em;flex-shrink:0}
        .roto2tools-nav-link span{transition:opacity .2s ease,max-width .3s ease .1s}
        #nav-toggle-btn{margin-top:auto;border-top:1px solid rgba(255,255,255,.1);border-left:4px solid transparent!important;font-style:italic;color:#888}
        .nav-collapsed .modal-dialog.modal-xl{max-width:840px}
        .nav-collapsed .roto2tools-nav{width:70px}
        .nav-collapsed .roto2tools-nav-link{justify-content:center;padding:12px}
        .nav-collapsed .roto2tools-nav-link span{opacity:0;max-width:0}
        .roto2tools-content{flex-grow:1;padding:25px;position:relative}
        .roto2tools-content-pane{display:none;animation:fadeIn .4s ease}
        .roto2tools-content-pane.active{display:block}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .tag-input-component{display:flex;flex-direction:column;gap:15px}.tag-input-header{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:10px}.tag-input-header h2{font-size:1.5em;color:#fff;margin:0}.tag-input-header .tag-count{font-size:.8em;color:#aaa;margin-left:8px}.clear-list-btn{background:rgba(255,80,80,.2);color:#ff8a8a;border:1px solid rgba(255,80,80,.4);border-radius:6px;padding:5px 10px;cursor:pointer;transition:all .2s}.clear-list-btn:hover{background:rgba(255,80,80,.4);color:#fff}.tags-display{background-color:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:10px;min-height:150px;max-height:250px;overflow-y:auto;display:flex;flex-wrap:wrap;gap:8px;align-content:flex-start}.tags-display::-webkit-scrollbar{width:8px}.tags-display::-webkit-scrollbar-track{background:rgba(0,0,0,.2);border-radius:4px}.tags-display::-webkit-scrollbar-thumb{background:rgba(255,255,255,.3);border-radius:4px}.tags-display::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,.5)}.tag{background:#444;color:#eee;padding:5px 12px;border-radius:15px;display:inline-flex;align-items:center;font-size:.95em;border:1px solid #555;font-weight:500}.tag .delete-tag{cursor:pointer;margin-left:8px;font-weight:700;color:#aaa;transition:color .2s}.tag .delete-tag:hover{color:#ff5a4b}.tag-input-controls{display:flex;gap:10px}.tag-input-controls input[type=text]{flex-grow:1;padding:10px;border:1px solid rgba(255,255,255,.15);border-radius:6px;background-color:rgba(0,0,0,.2);color:#f0f0f0}.tag-input-controls input[type=text]:focus{outline:0;border-color:#589cfc;box-shadow:0 0 0 2px rgba(88,156,252,.5)}.add-tag-btn{padding:10px 20px;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:700;background:#5cb85c;transition:background-color .2s}.add-tag-btn:hover{background:#4cae4c}
        .static-content-section{padding:10px}.static-content-section h2{margin-top:0}.static-content-section p{color:#ccc;max-width:600px}.about-version{margin-top:20px;color:#888}.backup-buttons{display:flex;gap:15px;margin-top:20px}.rt2-button{padding:10px 20px;color:#fff;border:1px solid rgba(255,255,255,.2);border-radius:8px;cursor:pointer;font-weight:700;text-shadow:1px 1px 2px rgba(0,0,0,.4);transition:all .2s ease;box-shadow:0 4px 6px rgba(0,0,0,.1);display:inline-flex;align-items:center;gap:8px}.rt2-button:hover{transform:translateY(-2px);box-shadow:0 6px 8px rgba(0,0,0,.15)}.rt2-button:active{transform:translateY(1px);box-shadow:0 2px 3px rgba(0,0,0,.1)}.rt2-button-save{background:linear-gradient(145deg,#5cb85c,#4CAF50)}.rt2-button-close{background-color:rgba(85,85,85,.8)}.rt2-button-export{background:#337ab7}.rt2-button-import{background:#f0ad4e}
        .import-list-btn:hover{background:#286090!important}
        `;
        GM_addStyle(Roto2Toolscss);
    } catch (e) {
        console.error("Roto2Tools: Error al cargar recursos CSS.", e);
        alert("Roto2Tools: No se pudieron cargar algunos estilos. La apariencia puede ser incorrecta.");
    }
    (function(window, $, toastr, Roto2ToolsUtils, Roto2ToolsMenu, Roto2ToolsProcessing) {
        if (!$) { console.error("Roto2Tools: jQuery no cargado."); return; }
        if (!toastr) { console.error("Roto2Tools: Toastr no cargado."); return; }
        if (!Roto2ToolsUtils) { console.error("Roto2Tools: Módulo Utils no cargado."); return; }
        if (!Roto2ToolsMenu) { console.error("Roto2Tools: Módulo Menu no cargado."); return; }
        if (!Roto2ToolsProcessing) { console.error("Roto2Tools: Módulo Processing no cargado."); return; }
        toastr.options = {closeButton: false, debug: false, newestOnTop: false, progressBar: true, positionClass: "toast-bottom-right", preventDuplicates: true, onclick: null, showDuration: "350", hideDuration: "1000", timeOut: "6000", extendedTimeOut: "2000", showEasing: "swing", hideEasing: "linear", showMethod: "fadeIn", hideMethod: "fadeOut"};
        const telefono = $("#fc-mobile-version-tag-for-monitoring");
        const telefonoClasico = $(".mobiletitlebottom");
        const clasico = $("a:contains('Nuevo diseño')");
        const listaIconosFC = $("strong:contains('ForoCoches Smilies')");
        const noShur = $("#user-online-status");
        const scriptVersion = GM_info.script.version;
        if (telefono.length || telefonoClasico.length) { toastr["warning"](`No funciona en telefonos <img src="https://forocoches.com/foro/images/smilies/smash2.gif">`, `Roto2Tools`); return; }
        if (clasico.length) { toastr["info"](`No funciona en el foro clasico <img src="https://forocoches.com/foro/images/smilies/eaea.gif">`, `Roto2Tools`); return; }
        if (listaIconosFC.length) { return; }
        if (!noShur.length) { toastr["error"](`No funciona si no estas logeado`, `Roto2Tools <img src="https://forocoches.com/foro/images/smilies/nono.gif">`); return; }
        let resaltarHilos = GM_getValue("resaltarHilos", []);
        let resaltarContactos = GM_getValue("resaltarContactos", []);
        let ocultarHilos = GM_getValue("ocultarHilos", []);
        let ocultarContactos = GM_getValue("ocultarContactos", []);
        let menuInputRefs = {};
        function saveDataAndUpdate(newData) {
            GM_setValue("ocultarHilos", newData.ocultarHilos);
            GM_setValue("resaltarHilos", newData.resaltarHilos);
            GM_setValue("ocultarContactos", newData.ocultarContactos);
            GM_setValue("resaltarContactos", newData.resaltarContactos);
            ocultarHilos = newData.ocultarHilos;
            resaltarHilos = newData.resaltarHilos;
            ocultarContactos = newData.ocultarContactos;
            resaltarContactos = newData.resaltarContactos;
            console.log("Roto2Tools: Datos guardados. Recarga la página para ver todos los cambios.");
            toastr.info("Recarga la página para aplicar todos los cambios guardados.", "Roto2Tools");
        }
        function runProcessingLogic() {
            const processingOptions = {ocultarHilos, resaltarHilos, ocultarContactos, resaltarContactos};
            Roto2ToolsProcessing.processThreads(processingOptions);
            Roto2ToolsProcessing.processMessages(processingOptions);
            Roto2ToolsProcessing.cleanupSeparators();
            Roto2ToolsProcessing.applyFinalStyles();
        }
        try {
            menuInputRefs = Roto2ToolsMenu.create({
                initialResaltarHilos: resaltarHilos,
                initialOcultarHilos: ocultarHilos,
                initialResaltarContactos: resaltarContactos,
                initialOcultarContactos: ocultarContactos,
                onSave: saveDataAndUpdate,
                scriptVersion: scriptVersion
            });
            runProcessingLogic();
        } catch (e) {
            console.error("Roto2Tools: Error durante la inicialización o procesamiento.", e);
            toastr.error("Ocurrió un error al iniciar Roto2Tools. Revisa la consola.", "Error Roto2Tools");
        }
    })(window, window.jQuery, window.toastr, window.Roto2ToolsUtils, window.Roto2ToolsMenu, window.Roto2ToolsProcessing);
})();
