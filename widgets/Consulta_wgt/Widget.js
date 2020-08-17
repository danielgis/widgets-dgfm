import declare from 'dojo/_base/declare';
import BaseWidget from 'jimu/BaseWidget';
import query from "dojo/query";
import on from 'dojo/on';
import domClass from "dojo/dom-class";
// import "dojo/domReady!";

// To create a widget, you need to derive from BaseWidget.
export default declare([BaseWidget, query], {

    // Custom widget code goes here

    baseClass: 'consulta-wgt',

    // add additional properties here

    // methods to communication with app container:
    postCreate() {
        self = this;
        this.inherited(arguments);
        console.log('Consulta_wgt::postCreate');;
    },

    _addEventToLayerQuery() {
        query(".capa_consulta_cw").forEach(function(node) {
            console.log(node);
            on(node, 'click', function(evt) {
                self._setTitleBox(evt);
            });
        });

    },

    _setTitleBox(evt) {
        var title = evt.currentTarget.innerText;
        var id = evt.currentTarget.id;
        self.titulo_consulta.innerText = title
        self.listaCapasconsulta.hidden = true;

        var nodeContainer_cw = query(".container_cw")
        dojo.toggleClass(nodeContainer_cw[0], 'active')
        query('.formulario_cw').forEach(function(node) {
            if (node.dataset.dojoAttachPoint.includes(id)) {
                node.hidden = false;
            } else {
                node.hidden = true;
            }
        })
    },

    startup() {
        this.inherited(arguments);
        console.log('Consulta_wgt::startup');
        this._addEventToLayerQuery();
    },
    onOpen() {
        console.log('Consulta_wgt::onOpen');
        // this._addEventToLayerQuery();
    },
    // onClose(){
    //   console.log('Consulta_wgt::onClose');
    // },
    // onMinimize(){
    //   console.log('Consulta_wgt::onMinimize');
    // },
    // onMaximize(){
    //   console.log('Consulta_wgt::onMaximize');
    // },
    // onSignIn(credential){
    //   console.log('Consulta_wgt::onSignIn', credential);
    // },
    // onSignOut(){
    //   console.log('Consulta_wgt::onSignOut');
    // }
    // onPositionChange(){
    //   console.log('Consulta_wgt::onPositionChange');
    // },
    // resize(){
    //   console.log('Consulta_wgt::resize');
    // }
});