import declare from 'dojo/_base/declare';
import BaseWidget from 'jimu/BaseWidget';
// import projection from "esri/geometry/projection";
import SpatialReference from "esri/SpatialReference";
import ProjectParameters from "esri/tasks/ProjectParameters";
import GeometryService from 'esri/tasks/GeometryService';

import Point from "esri/geometry/Point";
import Polygon from 'esri/geometry/Polygon';
import SimpleFillSymbol from 'esri/symbols/SimpleFillSymbol';
import SimpleLineSymbol from 'esri/symbols/SimpleLineSymbol';
import SimpleMarkerSymbol from 'esri/symbols/SimpleMarkerSymbol';
// import webMercatorUtils from "esri/geometry/webMercatorUtils";
import Color from 'dojo/_base/Color';
import GraphicsLayer from "esri/layers/GraphicsLayer";
import Graphic from 'esri/graphic';
import Message from "jimu/dijit/Message";
import InfoTemplate from "esri/InfoTemplate";
import TextSymbol from "esri/symbols/TextSymbol";
import Font from "esri/symbols/Font";
import BusyIndicator from 'esri/dijit/util/busyIndicator';
import 'https://unpkg.com/read-excel-file@4.x/bundle/read-excel-file.min.js';

// To create a widget, you need to derive from BaseWidget.
export default declare([BaseWidget], {

    // Custom widget code goes here

    baseClass: 'localizar-wgt',
    tabSelected: 'punto',
    obj_resultados: [],
    obj_index: 0,
    obj_resultados_xls: {},

    // add additional properties here

    // methods to communication with app container:
    postCreate() {
        this.inherited(arguments);
        console.log('Localizar_wgt::postCreate');
        self_lw = this;
    },

    _showMessage(message, type = 'message') {
        switch (type) {
            case 'question':
                let messagebox = new Message({
                    type: type,
                    titleLabel: `Widget ${this.nls._widgetLabel}: ${type}`,
                    message: message,
                    buttons: [{
                        label: 'SI',
                        onClick: lang.hitch(this, lang.hitch(this, function() {
                            messagebox.close();
                        }))
                    }, {
                        label: 'NO',
                        onClick: lang.hitch(this, lang.hitch(this, function() {
                            this._cleanMap();
                            messagebox.close();
                        }))
                    }]
                });

                break;
            default:
                new Message({
                    type: type,
                    titleLabel: `Widget ${this.nls._widgetLabel}: ${type}`,
                    message: message,
                });
                break;
        }

    },

    // Funcion que permite habilitar el contenido de acuerdo al tab seleccionado
    _tabToggleForm(evt) {
        self_lw.tabSelected = evt.currentTarget.id;
        if (evt.currentTarget.classList.contains('is-active')) {
            return
        };
        dojo.query('.opcion_lw').forEach(function(node) {
            let container_option = self_lw[`${node.id}_${node.classList[0]}`]
            if (node.id == self_lw.tabSelected) {
                node.classList.toggle('is-active')
                container_option.classList.toggle('is-active')
            } else {
                node.classList.remove('is-active');
                container_option.classList.remove('is-active')
            }
        });
    },

    _validateRucNumber_lw(evt) {
        var val = evt.currentTarget.value;
        evt.currentTarget.value = val.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    },

    _applyGraphic(evt) {
        console.log(self_lw.tabSelected);
        switch (self_lw.tabSelected) {
            case 'punto':
                self_lw._graphPoint();
                break;
            case 'poligono':
                self_lw._graphPolygon();
                break;

            default:
                break;
        }

    },

    _graphPoint() {
        // Captura del SRC seleccionado
        let srid = self_lw.select_punto_opcion_lw.value;

        if (srid == '') {
            self_lw._showMessage("Debe seleccionar un Sistema de Referencia Espacial")
            self_lw.ap_select_punto_lw.classList.add('is-danger')
            return
        }

        self_lw.ap_select_punto_lw.classList.remove('is-danger')

        let src = srid == '4326' ? 'gcs' : 'utm';

        // Validacion de cordenada X ingresada 
        let x = self_lw.ap_input_x_lw.value;


        if (!x) {
            self_lw.ap_input_x_lw.classList.add('is-danger')
            return
        };

        // x = parseInt(x);

        if (!self_lw._validateCoordX(x, src)) {
            self_lw.ap_input_x_lw.classList.add('is-danger')
            return
        };

        self_lw.ap_input_x_lw.classList.remove('is-danger')

        // Validacion de cordenada Y ingresada
        let y = self_lw.ap_input_y_lw.value;

        if (!y) {
            self_lw.ap_input_y_lw.classList.add('is-danger')
            return
        };

        // y = parseInt(y);

        if (!self_lw._validateCoordY(y, src)) {
            self_lw.ap_input_y_lw.classList.add('is-danger')
            return
        };

        self_lw.ap_input_y_lw.classList.remove('is-danger')

        let geometryService = new GeometryService("https://geoportal.minem.gob.pe/minem/rest/services/Utilities/Geometry/GeometryServer");


        let spatialReference = new SpatialReference({ wkid: parseInt(srid) });
        let point = new Point(parseFloat(x), parseFloat(y), spatialReference);
        let pointTransform = null;

        let parameters = new ProjectParameters();
        parameters.geometries = [point.normalize()];
        parameters.outSR = self_lw.map.spatialReference;
        parameters.transformForward = true;

        // var thiss = this;
        //thiss.map.addLayer(thiss.layer);
        geometryService.project(parameters);
        geometryService.on("project-complete", function(results) {
            pointTransform = results.geometries[0];
            let symbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_SQUARE, 15, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 2), new Color([0, 255, 0, 0.25]));
            // let symbol = new SimpleMarkerSymbol();

            let graphic = new Graphic(pointTransform, symbol);
            console.log(graphic);
            if (graphic.geometry.x == "NaN" || graphic.geometry.y == "NaN") {
                self_lw._showMessage("No se puede referenciar la coordenada en el mapa");
                // self_lw.obj_index = self_lw.obj_index - 1;
                // console.log("No se puede referenciar la coordenada en el mapa");
                return
            }



            // self_lw.obj_index = self_lw.map.graphics.graphics.length;
            self_lw.obj_index = self_lw.obj_index + 1;
            let name = `grafico_${self_lw.obj_index}`;

            self_lw.obj_resultados.push(name);

            let graphicLayer = new GraphicsLayer({ id: name });

            let font = new Font("15px", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLD, "Arial");
            let txtSym = new TextSymbol(name, font, new Color([250, 0, 0, 0.9]));
            txtSym.setOffset(-15, -5).setAlign(TextSymbol.ALIGN_END)
            txtSym.setHaloColor(new Color([255, 255, 255]));
            txtSym.setHaloSize(1.5);
            let graphicLabel = new Graphic(pointTransform, txtSym);

            graphicLayer.add(graphic);
            graphicLayer.add(graphicLabel);

            self_lw.map.addLayer(graphicLayer);
            // self_lw.map.graphics.add(graphic);
            // self_lw.map.graphics.add(graphicLabel);
            // self_lw.map.centerAndZoom(pointTransform, 10);
            // self_lw._addResultados(graphic);
            // self_lw.ap_none_resultados_opcion_lw.hidden = true;
            // dojo.query('.container_resultados_lw').addClass('is-active')
            // self_lw.ap_resultados_lw.click();

            graphic.setInfoTemplate(new InfoTemplate("Coordenadas", "<span>Este / Long: </span>" + point.x + "<br />" + "<span>Norte / Lat: </span>" + point.y));
            self_lw.map.infoWindow.setTitle(graphic.getTitle());
            self_lw.map.infoWindow.setContent(graphic.getContent());
            self_lw.map.infoWindow.show(pointTransform);
            self_lw.map.centerAndZoom(pointTransform, 10);


            self_lw._addResultados(graphicLayer, name);
            self_lw.ap_none_resultados_opcion_lw.hidden = true;

            dojo.query('.container_resultados_lw').addClass('is-active')
            self_lw.ap_resultados_lw.click();
        });
        geometryService.on("error", function(error) {
            self_lw._showMessage(error.message, type = 'error')
            console.log(error);
        })
    },


    _graphPolygon() {
        self_lw.busyIndicator_lw.show()


        if (self_lw.ap_upload_file_lw.value == "") {
            self_lw._showMessage("Debe cargar un archivo en formato *.xlsx", type = 'error')
            self_lw.busyIndicator_lw.hide()
            return
        }



        let srid = self_lw.select_poligono_opcion_lw.value;

        if (srid == '') {
            self_lw._showMessage("Debe seleccionar un Sistema de Referencia Espacial")
            self_lw.ap_select_poligono_lw.classList.add('is-danger')
            self_lw.busyIndicator_lw.hide();
            return
        };

        self_lw.ap_select_poligono_lw.classList.remove('is-danger');



        let rings = self_lw.obj_resultados_xls.slice(1);
        let polygonJson = { "rings": [rings], "spatialReference": { "wkid": parseInt(srid) } };


        let geometryService = new GeometryService("https://geoportal.minem.gob.pe/minem/rest/services/Utilities/Geometry/GeometryServer");

        let polygon = new Polygon(polygonJson);
        let polygonTransform = null;

        let parameters = new ProjectParameters();
        parameters.geometries = [polygon];
        parameters.outSR = self_lw.map.spatialReference;
        parameters.transformForward = true;

        geometryService.project(parameters);
        geometryService.on("project-complete", function(results) {

            polygonTransform = results.geometries[0];

            self_lw.obj_index = self_lw.obj_index + 1;
            let name = `grafico_${self_lw.obj_index}`;
            self_lw.obj_resultados.push(name);

            let graphicLayer = new GraphicsLayer({ id: name });

            let symbol = new SimpleFillSymbol(
                SimpleFillSymbol.STYLE_NULL,
                new SimpleLineSymbol(
                    SimpleLineSymbol.STYLE_SOLID,
                    new Color([255, 0, 0]), 3
                ),
                new Color([125, 125, 125, 0.35]));

            let graphic = new Graphic(polygonTransform, symbol);

            let font = new Font("15px", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLD, "Arial");
            let txtSym = new TextSymbol(name, font, new Color([250, 0, 0, 0.9]));
            txtSym.setOffset(-15, -5).setAlign(TextSymbol.ALIGN_END)
            txtSym.setHaloColor(new Color([255, 255, 255]));
            txtSym.setHaloSize(1.5);

            let center = polygonTransform.getCentroid();

            let graphicLabel = new Graphic(center, txtSym);

            graphicLayer.add(graphic);
            graphicLayer.add(graphicLabel);

            self_lw.map.addLayer(graphicLayer);
            // self_lw.map.infoWindow.show(center);
            self_lw.map.centerAndZoom(center, 10);


            self_lw._addResultados(graphicLayer, name);
            self_lw.ap_none_resultados_opcion_lw.hidden = true;

            dojo.query('.container_resultados_lw').addClass('is-active')
            self_lw.ap_resultados_lw.click();

            self_lw.busyIndicator_lw.hide();

        });
        geometryService.on("error", function(error) {
            self_lw.busyIndicator_lw.hide();
            self_lw._showMessage(error.error.message, type = 'error')
        });



    },

    _validateCoordX(x, src) {
        let response = true;
        x = parseFloat(x)
        switch (src) {
            case 'gcs':
                response = x >= -180 & x <= 180 ? true : false
                return response;
            case 'utm':
                response = x >= 0 & x <= 1000000 ? true : false
                return response
            default:
                break;
        }
    },

    _validateCoordY(y, src) {
        let response = true;
        y = parseFloat(y)
        switch (src) {
            case 'gcs':
                response = y >= -90 & y <= 90 ? true : false
                return response;
            case 'utm':
                response = y >= 0 & y <= 10000000 ? true : false
                return response;
            default:
                break;
        }
    },

    _addResultados(graphicLayer, name) {
        // self_lw.obj_index = self_lw.obj_index + 1;
        // let id_label = `grafico_${self_lw.obj_index}`;
        // let id = `${name}_lw`
        let i_class = self_lw.tabSelected == 'punto' ? 'far fa-dot-circle' : 'fas fa-draw-polygon'
        let icon_elm = `<span class="icon is-small"><i class="${i_class}"></i></span>`

        let tr = dojo.create('tr');

        // self_lw.obj_resultados[id] = {
        //     idx_graph: self_lw.obj_index - 1,
        //     idx_label: self_lw.obj_index,
        //     extent: graph._extent
        // }
        let td_array = [];
        td_array.push(`<td>${icon_elm}</td>`);
        td_array.push(`<td id="${name}_name" class="has-text-left" contenteditable='true'>${name}</td>`);
        td_array.push(`<td><span id="${name}_ext" class="icon is-small"><i class="fas fa-search"></i></span></td>`);
        td_array.push(`<td><span id="${name}_del" class="icon is-small" style="color: #FF5722;"><i class="far fa-trash-alt"></i></span></td>`);

        let tds = td_array.join('');

        // let tds = `<td>${icon_elm}</td><td id="${name}_name" class="has-text-left" contenteditable='true'>${name}</td><td><span id="${name}_ext" class="icon is-small"><i class="fas fa-search"></i></span></td>`;
        tr.id = name;
        tr.innerHTML = tds;
        tr.style.cursor = "pointer";
        self_lw.ap_resultados_body_lw.appendChild(tr)
        dojo.query(`#${name}_ext`).on('click', self_lw._zoomToExtentByResult);
        dojo.query(`#${name}_name`).on('input', self_lw._editaNameResult);
        dojo.query(`#${name}_del`).on('click', self_lw._deleteResult);
    },

    _zoomToExtentByResult(evt) {
        let id = evt.currentTarget.id.replace('_ext', '');
        let lyr = self_lw.map.getLayer(id);
        self_lw.map.setExtent(lyr.graphics[0]._extent, true);
    },

    _editaNameResult(evt) {
        let id = evt.currentTarget.id.replace('_name', '');
        // let idx = self_lw.obj_resultados[id].idx_label;
        // console.log(self_lw.map.graphics.graphics[idx].symbol.text);
        // let lyr = self_lw.map.getLayer(id);
        self_lw.map.getLayer(id).graphics[1].symbol.text = evt.currentTarget.innerText;
        self_lw.map.getLayer(id).refresh()
            // console.log(evt.currentTarget.innerText);
    },

    _deleteResult(evt) {
        let id = evt.currentTarget.id.replace('_del', '');
        let elem = dojo.query(`#${id}`);
        self_lw.map.removeLayer(self_lw.map.getLayer(id));
        elem[0].parentNode.removeChild(elem[0]);
    },

    _uploadFile(evt) {
        self_lw.busyIndicator_lw.show();
        if (!evt.currentTarget.files[0]) {
            self_lw.busyIndicator_lw.hide();
            return
        };
        let name = evt.currentTarget.files[0].name;

        if (!name.endsWith('.xlsx')) {
            self_lw._showMessage('El archivo cargado no es de formato *xlsx', type = 'error');
            self_lw.busyIndicator_lw.hide();
            return
        }

        readXlsxFile(evt.currentTarget.files[0])
            .then((data) => {
                self_lw.ap_upload_file_name_lw.innerText = name;
                self_lw.ap_container_upload_file_lw.classList.add('is-primary')
                self_lw.obj_resultados_xls = data;
                self_lw.ap_help_message_lw.classList.add('has-text-primary');
                self_lw.ap_help_message_lw.innerText = 'El archivo *.xlsx se cargó correctamente';
                self_lw.busyIndicator_lw.hide();
            })
            .catch((error) => {
                self_lw.ap_container_upload_file_lw.classList.add('is-danger')
                self_lw.ap_help_message_lw.classList.add('has-text-danger');
                self_lw.ap_help_message_lw.innerText = 'Ocurrio un error al cargar el archivo';
                self_lw._showMessage(error.message, type = 'error')
                self_lw.busyIndicator_lw.hide();
            });
    },

    startup() {
        this.inherited(arguments);
        console.log('Localizar_wgt::startup');
        this.busyIndicator_lw = BusyIndicator.create({
            target: this.domNode.parentNode.parentNode.parentNode,
            backgroundOpacity: 0
        });
        dojo.query('.opcion_lw').on('click', this._tabToggleForm);
        dojo.query('.btn_aplicar_lw').on('click', this._applyGraphic);
        dojo.query('.upload_file_lw').on('change', this._uploadFile);
    },
    // onOpen() {
    //   console.log('Localizar_wgt::onOpen');

    // },
    // onClose(){
    //   console.log('Localizar_wgt::onClose');
    // },
    // onMinimize(){
    //   console.log('Localizar_wgt::onMinimize');
    // },
    // onMaximize(){
    //   console.log('Localizar_wgt::onMaximize');
    // },
    // onSignIn(credential){
    //   console.log('Localizar_wgt::onSignIn', credential);
    // },
    // onSignOut(){
    //   console.log('Localizar_wgt::onSignOut');
    // }
    // onPositionChange(){
    //   console.log('Localizar_wgt::onPositionChange');
    // },
    // resize(){
    //   console.log('Localizar_wgt::resize');
    // }
});