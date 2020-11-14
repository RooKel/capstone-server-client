import {UIDiv, UIPanel} from "./libs/ui.js";

function LoadingSpinner(editor) {
    var signals = editor.signals;

    var container = new UIPanel();
    container.setId('spinner-init');

    var loaderDiv = new UIDiv();
    loaderDiv.dom.className = 'loader-init';
    container.add(loaderDiv);

    signals.loadStateChanged.add(function (state) {
        if(state === 'open')
        {
            container.dom.id = "spinner"
            loaderDiv.dom.className = 'loader';
        }
        else if(state === 'close')
        {
            container.dom.id = "spinner-closed"
            loaderDiv.dom.className = 'loader-closed';
        }
    });

    return container;
}

export {LoadingSpinner};
