import declare from 'dojo/_base/declare';
import _WidgetsInTemplateMixin from 'dijit/_WidgetsInTemplateMixin';
import BaseWidget from 'jimu/BaseWidget';
// import query from "dojo/query";
import lang from 'dojo/_base/lang';
import LayerInfos from 'jimu/LayerInfos/LayerInfos';
import Query from "esri/tasks/query";
import QueryTask from "esri/tasks/QueryTask";
import StatisticDefinition from "esri/tasks/StatisticDefinition";
// import InfoTemplate from "esri/InfoTemplate";
import FeatureLayer from "esri/layers/FeatureLayer";

import GraphicsLayer from "esri/layers/GraphicsLayer";
import Graphic from 'esri/graphic';

import SimpleFillSymbol from "esri/symbols/SimpleFillSymbol";
import SimpleLineSymbol from 'esri/symbols/SimpleLineSymbol';
import SimpleMarkerSymbol from 'esri/symbols/SimpleMarkerSymbol';
import Color from 'dojo/_base/Color';

import Message from "jimu/dijit/Message";
// import 'jimu/dijit/LoadingIndicator';
// import 'jimu/dijit/LoadingShelter'
import BusyIndicator from 'esri/dijit/util/busyIndicator';
// import domConstruct from 'dojo/dom-construct';
// import on from 'dojo/on';
// import domClass from "dojo/dom-class";
// import "dojo/domReady!";

// To create a widget, you need to derive from BaseWidget.
export default declare([BaseWidget, _WidgetsInTemplateMixin, Query,
    QueryTask,
    StatisticDefinition,
    // FeatureLayer
], {

    // Custom widget code goes here

    baseClass: 'consulta-wgt',
    iniClause: '1=1',

    layersMap: [],

    field_dep_nm_depa: 'NM_DEPA',
    field_dep_cd_depa: 'CD_DEPA',

    field_prov_nm_prov: 'NM_PROV',
    field_prov_cd_prov: 'CD_PROV',

    field_dist_nm_dist: 'NM_DIST',
    field_dist_cd_dist: 'CD_DIST',


    // // Campos DM Ingemmet
    // field_codigou_dm: 'CODIGOU',
    // field_concesion_dm: 'CONCESION',
    // field_sustancia_dm: 'SUSTANCIA',

    //  Campos DM Minem
    field_codigou_dm: 'ID_UNIDAD',
    field_concesion_dm: 'NOMBRE',
    field_sustancia_dm: 'ID_CLASE_SUSTANCIA',

    // Campos DC
    field_id: 'ESRI_OID', // Objectid del minero informal
    field_minero_informal: 'NOMBRE_MIN', // Nombre del minero informal
    field_minero_informal_rep: 'NOMBRE_REP', // Nombre del representante
    field_m_ruc: 'M_RUC', // RUC del minero informal
    field_derecho_minero: 'NOMBRE_DM', // Nombre del derecho mineroo
    field_id_unidad: 'CODIGOU', // Identificador del derecho minero (CODIGOU)
    field_tipo_persona: 'M_TIPO_PERSONA', // Tipo de persona (natural, juridica)
    field_id_ubigeo_inei: 'CD_DIST', // Ubigeo

    // Campos Tabla DC
    field_id_tb: 'ESRI_OID', // Objectid del minero informal
    field_minero_informal_tb: 'NOMBRE_MIN', // Nombre del minero informal
    // field_minero_informal_rep_tb: 'NOMBRE_REP', // Nombre del representante
    field_m_ruc_tb: 'M_RUC', // RUC del minero informal
    field_derecho_minero_tb: 'NOMBRE_DM', // Nombre del derecho mineroo
    field_id_unidad_tb: 'CODIGOU', // Identificador del derecho minero (CODIGOU)
    field_tipo_persona_tb: 'M_TIPO_PERSONA', // Tipo de persona (natural, juridica)
    field_id_ubigeo_inei_tb: 'CD_DIST', // Ubigeo

    controller_query: '', // Permite identificar la opcion de consulta seleccionada
    controller_layer_query: false,

    controller_ubigeo: '',

    temporal_class_results: '',

    feature_dc: null,
    feature_dm: null,

    numero_registros: 0,
    numero_paginas: 0,
    registros_pagina: 1000,
    pagina_actual: 1,
    grupo_actual: 0,
    grupos_paginas: [],
    factor: 4,
    whereDefinition: '',

    // add additional properties here

    // methods to communication with app container:
    postCreate() {
        self_cw = this;
        this.inherited(arguments);
        // console.log('Consulta_wgt::postCreate');;
        this._getAllLayers();
        this.feature_dc = this.layersMap.getLayerInfoById(this.config.layer_id_dc);
        this.feature_dc_table = this.layersMap.getTableInfoById(this.config.table_id_dc);
        this.feature_dm = this.layersMap.getLayerInfoById(this.config.layer_id_dm);
        this.feature_dep = this.layersMap.getLayerInfoById(this.config.layer_id_dep);
        this.feature_prov = this.layersMap.getLayerInfoById(this.config.layer_id_prov);
        this.feature_dist = this.layersMap.getLayerInfoById(this.config.layer_id_dist);
    },

    _getAllLayers() {
        LayerInfos.getInstance(this.map, this.map.itemInfo)
            .then(lang.hitch(this, function(layerInfosObj) {
                this.layersMap = layerInfosObj;
            }));
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

    // Metodos para agregar opciones a las etiquetas 'select'
    _getDataByTipoPersona() {
        let id = this.config.layer_id_dc
            // let feature_dc = this.layersMap.getLayerInfoById(id);
        let query = new Query();
        query.where = `${this.field_tipo_persona} IS NOT NULL`;
        query.returnGeometry = false;
        query.returnDistinctValues = true;
        query.outFields = [this.field_tipo_persona];

        self_cw.feature_dc.layerObject.queryFeatures(query, function(results) {
            let features = results.features;
            if (features.length) {
                features.forEach(i => {
                    let opt = document.createElement("option");
                    opt.value = i.attributes[self_cw.field_tipo_persona];
                    opt.text = i.attributes[self_cw.field_tipo_persona];
                    self_cw.select_tipo_persona_cw.add(opt);
                });
                let opt = document.createElement("option");
                opt.value = '';
                opt.text = 'Todos';
                opt.selected = true;
                self_cw.select_tipo_persona_cw.add(opt);
            } else {
                self_cw._showMessage(self_cw.nls.error_tipo_persona_count)
            }
        }, function(error) {
            self_cw._showMessage(`${self_cw.nls.error_tipo_persona}\n${error.message}`, type = 'error')
        })
    },

    _getDataByDepartamento() {
        let id = this.config.layer_id_dep
        let feature_dep = this.layersMap.getLayerInfoById(id);
        let queryTask = new QueryTask(feature_dep.getUrl());
        let query = new Query();
        query.where = `${this.field_dep_cd_depa} <> 99`;
        query.returnGeometry = false;
        query.outFields = [this.field_dep_nm_depa, this.field_dep_cd_depa];
        query.orderByFields = [this.field_dep_nm_depa];
        queryTask.execute(query, function(results) {
            let features = results.features;
            if (features.length) {
                results.features.forEach(i => {
                    let opt = document.createElement("option");
                    opt.value = i.attributes[self_cw.field_dep_cd_depa];
                    opt.text = i.attributes[self_cw.field_dep_nm_depa];
                    self_cw.departamento_cw.add(opt);
                })
                let opt = document.createElement("option");
                opt.value = '';
                opt.text = 'Todos';
                opt.selected = true;
                self_cw.departamento_cw.add(opt);
            } else {
                self_cw._showMessage(self_cw.nls.error_departamento_count)
            }
        }, function(error) {
            self_cw._showMessage(`${self_cw.nls.error_departamento}\n${error.message}`, type = 'error')
        })
    },


    _getDataByProvincia(evt) {
        // Evento que se ejecuta cuando el usuario selecciona un departamento
        // Carga las provincias pertenecientes al departamento seleccionado
        // Realiza el zoom en el mapa al departamento seleccionado

        // habilitar loader
        this.busyIndicator.show();

        // Obteniendo datos de la opcion seleccionada
        let cd_depa = evt.target.value;

        // Capturando el codigo de la provincia en el controlador de ubigeo
        this.controller_ubigeo = cd_depa;

        this.distrito_cw.innerHTML = '';
        this.container_distrito_cw.classList.remove('active');

        // Si se selecciono la opcion 'Todos' en el elemento 'Select' de departamentos
        if (cd_depa == '') {
            // Removemos el combo de provincias
            this.container_provincia_cw.classList.remove('active');
            // deshabilitar loader
            this.busyIndicator.hide();
            // Salimos del evento
            return
        }

        // Si el contenedor de provincias no esta activo
        if (!this.container_provincia_cw.classList.contains('active')) {
            // Activar el contenedor de provincias
            this.container_provincia_cw.classList.toggle('active');
        };

        // Obteniendo el LayerObject de provincias
        let id = this.config.layer_id_prov
        let feature_prov = this.layersMap.getLayerInfoById(id);
        let queryTask = new QueryTask(feature_prov.getUrl());

        // Definiendo el objeto Query para obtener las provincias del departamento
        let query = new Query();
        query.where = `${this.field_dep_cd_depa} = '${cd_depa}'`;

        query.returnGeometry = false;
        query.outFields = [this.field_prov_nm_prov, this.field_prov_cd_prov];
        query.orderByFields = [this.field_prov_nm_prov];

        self_cw._zoomExtendSelected(self_cw.feature_dep, query.where);

        // Ejecucion de consulta para obtener las opciones de provincias
        queryTask.execute(query, function(results) {
            let fragment = document.createDocumentFragment();
            // Zoom al departamento seleccionado
            let features = results.features;
            // Si se encontraron resultados
            if (features.length) {
                self_cw.provincia_cw.innerHTML = '';
                features.forEach(i => {
                    let opt = document.createElement("option");
                    opt.value = i.attributes[self_cw.field_prov_cd_prov];
                    opt.text = i.attributes[self_cw.field_prov_nm_prov];
                    // self_cw.provincia_cw.add(opt);
                    fragment.appendChild(opt);
                })
                let opt = document.createElement("option");
                opt.value = '';
                opt.text = 'Todos';
                opt.selected = true;
                fragment.appendChild(opt);
                // self_cw.provincia_cw.add(opt);
                self_cw.provincia_cw.appendChild(fragment);

            } else {
                // Notificar si no se encontraron elementos
                self_cw._showMessage(`${self_cw.nls.error_provincia_count}`)
            };
            // deshabilitar loader
            self_cw.busyIndicator.hide();
        }, function(error) {
            // Notificar si ocurrio algun error al momento de solicitar los datos
            self_cw._showMessage(`${self_cw.nls.error_provincia}\n${error.message}`, type = 'error')
            self_cw.busyIndicator.hide();
        });
    },

    _getDataByDistrito(evt) {
        // Evento que se ejecuta cuando el usuario selecciona una provincia
        // Carga las provincias pertenecientes a la provincia seleccionada
        // Realiza el zoom en el mapa a la provincia seleccionada

        // habilitar loader
        this.busyIndicator.show();

        // Obteniendo datos de la opcion seleccionada
        let cd_prov = evt.target.value;

        // Si se selecciono la opcion 'Todos' en el elemento 'Select' de provincias
        if (cd_prov == '') {
            // Anulamos los dos ultimos digitos del controlador de ubigeo
            this.controller_ubigeo = this.controller_ubigeo.substring(0, 2);
            // Ocultamos el selector de distritos
            this.container_distrito_cw.classList.remove('active');
            // deshabilitar loader
            this.busyIndicator.hide();
            return
        }

        // Si el contenedor de distrito no esta activo
        if (!this.container_distrito_cw.classList.contains('active')) {
            // Activar el contenedor de distrito
            this.container_distrito_cw.classList.toggle('active');
        }

        // Capturando el codigo de la provincia en el controlador de ubigeo
        this.controller_ubigeo = cd_prov;

        // Obteniendo el LayerObject de distritos
        let id = this.config.layer_id_dist;
        let feature_dist = this.layersMap.getLayerInfoById(id);
        let queryTask = new QueryTask(feature_dist.getUrl());

        // Definiendo el objeto Query para obtener los distritos de la provincia
        let query = new Query();
        query.where = `${this.field_prov_cd_prov} = '${cd_prov}'`;
        query.returnGeometry = false;
        query.outFields = [this.field_dist_nm_dist, this.field_dist_cd_dist];
        query.orderByFields = [this.field_dist_nm_dist];

        self_cw._zoomExtendSelected(self_cw.feature_prov, query.where);

        // Ejecucion de consulta para obtener las opciones de distritos
        queryTask.execute(query, function(results) {
            let fragment = document.createDocumentFragment();
            // Zoom a la provincia seleccionada
            // self_cw._zoomExtendSelected(self_cw.config.layer_id_prov, query.where);
            self_cw.distrito_cw.innerHTML = "";
            let features = results.features;
            // Si se encontraron resultados
            if (features.length) {
                features.forEach(i => {
                    let opt = document.createElement("option");
                    opt.value = i.attributes[self_cw.field_dist_cd_dist];
                    opt.text = i.attributes[self_cw.field_dist_nm_dist];
                    // self_cw.distrito_cw.add(opt);
                    fragment.appendChild(opt)
                })
                let opt = document.createElement("option");
                opt.value = '';
                opt.text = 'Todos';
                opt.selected = true;
                // self_cw.distrito_cw.add(opt);
                fragment.appendChild(opt);
                self_cw.distrito_cw.appendChild(fragment)
            } else {
                // Notificar si no se encontraron elementos
                self_cw._showMessage(`${self_cw.nls.error_distrito_count}`);
            };
            // deshabilitar loader
            self_cw.busyIndicator.hide();
        }, function(error) {
            // Notificar si ocurrio algun error al momento de solicitar los datos
            self_cw._showMessage(`${self_cw.nls.error_distrito}\n${error.message}`, type = 'error');
            // deshabilitar loader
            self_cw.busyIndicator.hide();
        });

    },

    _getDistritoSelected(evt) {
        // Evento que se ejecuta cuando el usuario selecciona una distrito
        // Realiza el zoom en el mapa al distrito seleccionado
        var cd_dist = evt.target.value;
        whereDefinition = `${this.field_dist_cd_dist} = '${cd_dist}'`
        if (cd_dist == '') {
            this.controller_ubigeo = this.controller_ubigeo.substring(0, 4)
            return
        }
        this.controller_ubigeo = cd_dist;
        this._zoomExtendSelected(this.feature_dist, whereDefinition);
        // this._zoomExtendSelected(this.config.layer_id_dist, whereDefinition);
    },

    // Metodos dedicados al frontend del widget

    _addEventToLayerQuery() {
        dojo.query(".capa_consulta_cw").on('click', this._setFormContainer);
    },

    _setFormContainer(evt) {
        var title = evt.currentTarget.innerText;

        self_cw.controller_query = evt.currentTarget.id;
        self_cw.titulo_consulta.innerText = title
        self_cw.ListaCapasConsulta.hidden = true;

        var nodeContainer_cw = dojo.query(".container_cw")
        dojo.toggleClass(nodeContainer_cw[0], 'active')
        dojo.query('.formulario_cw').forEach(function(node) {
            if (node.dataset.dojoAttachPoint.includes(self_cw.controller_query)) {
                node.hidden = false;
            } else {
                node.hidden = true;
            }
        })
    },

    _returnListaCapasConsulta() {
        var nodeContainer_cw = dojo.query(".container_cw");
        dojo.toggleClass(nodeContainer_cw[0], 'active');
        this.ListaCapasConsulta.hidden = false;
    },

    _addEventToTabsOptions() {
        dojo.query('.opcion_cw').on('click', this._connectTabsWithOptionContainer)
    },

    _connectTabsWithOptionContainer(evt) {
        var option = evt.currentTarget.innerText.toLowerCase();
        if (evt.currentTarget.classList.contains('is-active')) {
            return
        };
        dojo.query('.opcion_cw').forEach(function(node) {
            var container_option = self_cw[`${node.id}_${node.classList[0]}`]
            if (node.innerText.toLowerCase() == option) {
                node.classList.toggle('is-active')
                container_option.classList.toggle('active')
            } else {
                node.classList.remove('is-active');
                container_option.classList.remove('active')
            }
        });
    },

    _validateRucNumber(evt) {
        var val = evt.currentTarget.value;
        evt.currentTarget.value = val.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    },

    // Interaccion con el mapa

    _openPopupAutocamitcally(featureInfo, center, whereDefinition) {
        let query = new Query();
        query.where = whereDefinition;
        featureInfo.layerObject.queryFeatures(query, function(results) {
            self_cw.map.infoWindow.setFeatures(results.features);
            self_cw.map.infoWindow.show(center, self_cw.map.getInfoWindowAnchor(center));
            self_cw.map.centerAt(center);

            // self_cw.map.infoWindow.show(center, self_cw.map.getInfoWindowAnchor(center));
        });

    },

    _openPopupAutocamitcally2(featureLayer, center) {
        self_cw.map.infoWindow.setFeatures(featureLayer.features);
        self_cw.map.infoWindow.show(center, self_cw.map.getInfoWindowAnchor(center));
        self_cw.map.centerAt(center);
    },

    _zoomDmExtentToMap(evt) {

        // self_cw._applyQueryDM.click()
        let id = evt.currentTarget.innerText;
        let query = new Query();
        query.where = `${self_cw.field_codigou_dm} = '${id}'`
            // let id_layer = self_cw.config.layer_id_dm;
            // let feature = self_cw.layersMap.getLayerInfoById(id_layer);
        self_cw.feature_dm.setFilter(query.where);
        self_cw.feature_dm.show();

        self_cw.feature_dm.getLayerObject().then(function(response) {
            // self_cw.map.graphics.clear();
            response.queryFeatures(query, function(results) {
                if (results.features.length) {
                    // let symbol = new SimpleFillSymbol(
                    //     SimpleFillSymbol.STYLE_NULL,
                    //     new SimpleLineSymbol(
                    //         SimpleLineSymbol.STYLE_SOLID,
                    //         new Color([255, 0, 0]), 3
                    //     ),
                    //     new Color([125, 125, 125, 0.35]));

                    let ext = results.features[0].geometry.getExtent();
                    let center = results.features[0].geometry.getCentroid();

                    // let graphic = results.features[0].setSymbol(symbol)
                    // self_cw.map.graphics.add(graphic);
                    self_cw.map.infoWindow.setFeatures(results.features);
                    self_cw.map.infoWindow.show(center);
                    // self_cw.map.centerAt(center);
                    // self_cw._openPopupAutocamitcally2(results, center);
                    self_cw.map.setExtent(ext, true);

                } else {
                    self_cw._showMessage(`${self_cw.nls.none_element} ${id}, ${self_cw.nls.none_reference_map}`);
                }
            }, function(error) {
                self_cw._showMessage(`${self_cw.nls.error_query_feature} ${feature.title} (${query.where})\n${error.message}`);
            })
        }, function(error) {
            self_cw._showMessage(`${self_cw.nls.error_service} ${feature.title}\n${error.message}`, type = 'error');
        })
    },

    _zoomExtendSelected(feature, whereDefinition) {
        let query = new Query();
        query.where = whereDefinition;
        // let feature = this.layersMap.getLayerInfoById(idService);
        feature.getLayerObject().then(function(results) {
            results.queryExtent(query, function(res) {
                if (res.count) {
                    self_cw.map.setExtent(res.extent, true)
                } else {
                    self_cw._showMessage(`${self_cw.nls.none_element} ${whereDefinition}, ${self_cw.nls.none_reference_map}`);
                }

            }, function(error) {
                self_cw._showMessage(`${self_cw.nls.error_query_feature} ${feature.title} (${query.where})\n${error.message}`);
            })
        }, function(error) {
            self_cw._showMessage(`${self_cw.nls.error_service} ${feature.title}\n${error.message}`, type = 'error');
        });
    },

    // Proceso que realiza la consulta
    _applyQuery(evt) {
        this.busyIndicator.show();
        self_cw.ap_registros_encontrados_cw.innerHTML = '';
        switch (self_cw.controller_query) {
            case 'dc':
                // self_cw._applyQueryDC()
                self_cw._applyQueryDC2();
                break;
            case 'dm':
                // self_cw._applyQueryDM();
                self_cw._applyQueryDM2()
                break;
            default:
                break;
        }
    },

    _cloneNode(node) {
        var clone = node.nodeType == 3 ? document.createTextNode(node.nodeValue) : node.cloneNode(false);
        var child = node.firstChild;
        while (child) {
            clone.appendChild(self_cw._cloneNode(child));
            child = child.nextSibling;
        }
        return clone;
    },

    _rowNode() {
        let node = `<li style="display: none;" data-dojo-attach-point="ap_template_registros_resultados_cw">
                        <a class="container_head_registros_cw">
                            <div class="columns is-mobile">
                                <div class="column is-four-fifths title_registros_cw"></div>
                                <div class="column has-text-right"><span class="icon has-text-info"><i class="fas fa-search"></i></span></div>
                            </div>
                        </a>
                        <ul class="detalle_registros_resultados_cw">
                        </ul>
                    </li>`;
        var parser = new DOMParser();
        var doc = parser.parseFromString(node, 'text/html');
        return doc.body.childNodes[0];
    },

    _populateResultsDC(arrayResults, enumerate_ini = 1) {
        let fragment = document.createDocumentFragment();
        arrayResults.forEach(function(r, i) {
            let newRow = self_cw._rowNode();

            newRow.style.display = 'block';

            // var nodeTitle = dojo.query('.title_registros_cw', newRow)[0]
            newRow.getElementsByClassName('title_registros_cw')[0].innerText = `${enumerate_ini}. ${r[self_cw.field_minero_informal]}`;
            newRow.getElementsByClassName('container_head_registros_cw')[0].id = r[self_cw.field_id];

            // Lista campos

            var fieldsList = []
            fieldsList.push(`<li>${self_cw.nls.field_dc_ruc}: ${r[self_cw.field_m_ruc]}</li>`);
            fieldsList.push(`<li>${self_cw.nls.field_nombre_dm}: ${r[self_cw.field_derecho_minero]}</li>`);
            fieldsList.push(`<li>${self_cw.nls.field_codigou_dm}: <span class="tag is-primary codigou_cw">${r[self_cw.field_id_unidad]}<span></li>`);

            fieldsListNode = fieldsList.join('');

            newRow.getElementsByClassName('detalle_registros_resultados_cw')[0].innerHTML = fieldsListNode;

            fragment.appendChild(newRow);
            enumerate_ini = enumerate_ini + 1
        });
        self_cw.ap_registros_encontrados_cw.appendChild(fragment);
        dojo.query('.container_head_registros_cw').on('click', self_cw._showPopupRowSelectedClick);
        dojo.query('.codigou_cw').on('click', self_cw._zoomDmExtentToMap);
        this.busyIndicator.hide();
    },

    _showReinfos(evt) {
        self_cw.busyIndicator.show();
        let id = evt.currentTarget.parentElement.getAttribute('value');
        var elm = dojo.query(`.ul_registro_dc_${id}`);

        if (evt.currentTarget.parentElement.classList.contains('active')) {
            if (elm.length) {
                evt.currentTarget.parentElement.removeChild(elm[0])
                evt.currentTarget.parentElement.classList.toggle('active')
            }
            self_cw.busyIndicator.hide();
            return;
        }

        // let id = evt.currentTarget.parentElement.getAttribute('value');
        // let feature = self_cw.layersMap.getLayerInfoById(self_cw.config.layer_id_dc)

        let query = new Query();
        query.where = `(${self_cw.field_id_unidad} = '${id}') and (${self_cw.field_m_ruc} is not null)`;

        self_cw.feature_dc.setFilter(query.where);
        self_cw.feature_dc.show();

        // feature_sys.setFilter(query.where);
        // feature_sys.show();

        // evt.currentTarget.parentElement.classList.toggle('active')

        self_cw.feature_dc.getLayerObject().then(function(response) {
            response.queryFeatures(query, function(results) {
                if (results.features.length) {
                    evt.target.parentElement.classList.toggle('active')
                    let rownum = results.features.length;
                    evt.target.innerText = `${self_cw.nls.show_reinfos} (${rownum})`
                    let data = results.features.map((i) => i.attributes);
                    let lidata = data.map((i, index) => `<li class="registro_dc" id="${i[self_cw.field_id]}"><a>${index + 1}. ${i[self_cw.field_m_ruc]} - ${i[self_cw.field_tipo_persona].toLowerCase() == 'juridica' ? i[self_cw.field_minero_informal_rep] : i[self_cw.field_minero_informal]}</a></li>`)
                    let lidataString = lidata.join('');
                    let ulnode = dojo.create('ul');
                    ulnode.innerHTML = lidataString;
                    dojo.addClass(ulnode, `ul_registro_dc_${id}`)
                    evt.target.parentElement.appendChild(ulnode);
                    dojo.query('.registro_dc').on('click', self_cw._showPopupRowSelectedClick)
                } else {
                    evt.target.innerText = `${self_cw.nls.show_reinfos} (0)`
                    self_cw._showMessage(self_cw.nls.none_element_pl);
                };
                self_cw.busyIndicator.hide();
            }, function(error) {
                self_cw._showMessage(`${self_cw.nls.error_query_feature} ${feature.title} (${query.where})\n${error.message}`);
                self_cw.busyIndicator.hide();
            })
        }, function(error) {
            self_cw._showMessage(`${self_cw.nls.error_service} ${feature.title}\n${error.message}`, type = 'error')
            self_cw.busyIndicator.hide();
        })
    },

    _populateResultsDM(arrayResults, enumerate_ini = 1) {
        let fragment = document.createDocumentFragment();
        arrayResults.forEach(function(r, i) {
            // if (self_cw.temporal_class_results) {
            //     var newRow = self_cw.temporal_class_results;
            // } else {
            //     var newRow = dojo.clone(self_cw.ap_template_registros_resultados_cw);
            // }
            let newRow = self_cw._rowNode();

            newRow.style.display = 'block';

            // var nodeTitle = dojo.query('.title_registros_cw', newRow)[0]
            newRow.getElementsByClassName('title_registros_cw')[0].innerText = `${enumerate_ini}. ${self_cw.nls.field_codigou_dm}: ${r[self_cw.field_codigou_dm]}`;
            // newRow.getElementsByClassName('title_registros_cw')[0].id = r[self_cw.field_codigou_dm];
            newRow.getElementsByClassName('container_head_registros_cw')[0].id = r[self_cw.field_codigou_dm];
            // dojo.connect(nodeTitle, 'onclick', self_cw._showPopupRowSelectedClickDM);

            // Lista campos

            var fieldsList = []
            fieldsList.push(`<li>${self_cw.nls.field_nombre_dm}: ${r[self_cw.field_concesion_dm]}</li>`);
            fieldsList.push(`<li>${self_cw.nls.field_sustancia_dm}: ${r[self_cw.field_sustancia_dm]}</li>`);
            fieldsList.push(`<li value="${r[self_cw.field_codigou_dm]}"><span class="tag is-primary reinfos_cw">${self_cw.nls.show_reinfos}<span></li>`);

            fieldsListNode = fieldsList.join('');

            newRow.getElementsByClassName('detalle_registros_resultados_cw')[0].innerHTML = fieldsListNode;

            fragment.appendChild(newRow);
            enumerate_ini = enumerate_ini + 1;
        })
        self_cw.ap_registros_encontrados_cw.appendChild(fragment);
        dojo.query('.container_head_registros_cw').on('click', self_cw._showPopupRowSelectedClickDM);
        dojo.query('.reinfos_cw').on('click', self_cw._showReinfos);
        this.busyIndicator.hide();
    },

    _showPopupRowSelectedClick(evt) {
        let id_row = evt.currentTarget.id;

        let query = new Query();
        query.where = `${self_cw.field_id} = ${id_row}`

        self_cw.feature_dc.layerObject.selectFeatures(query, FeatureLayer.SELECTION_NEW)
            .then(
                function(response) {
                    let center = response[0].geometry;
                    if (!center) {
                        self_cw._showMessage(self_cw.nls.error_none_geometry);
                        return;
                    }

                    self_cw.map.infoWindow.setFeatures(response);
                    self_cw.map.infoWindow.show(center);
                    self_cw.map.centerAt(center);

                },
                function(error) {
                    self_cw._showMessage(`${self_cw.nls.error_query_feature} ${self_cw.feature_dc.title} (${query.where})\n${error.message}`);
                })
            .catch(function(error) {
                self_cw._showMessage(`${self_cw.nls.error_query_feature} ${self_cw.feature_dc.title}\n${error.message}`);
            })

    },



    _showPopupRowSelectedClickDM(evt) {
        let id = evt.currentTarget.id;

        let query = new Query();
        query.where = `${self_cw.field_codigou_dm} = '${id}'`;
        query.returnGeometry = true;
        query.outFields = ['*'];

        let queryTask = new QueryTask(self_cw.feature_dm.getUrl());
        queryTask.execute(query, function(results) {
            let center = results.features[0].geometry.getCentroid();
            if (!center) {
                self_cw._showMessage(self_cw.nls.error_none_geometry);
                return;
            };
            let ext = results.features[0].geometry.getExtent();
            self_cw.feature_dm.layerObject.selectFeatures(query, FeatureLayer.SELECTION_NEW).then(
                function(response) {
                    self_cw.map.infoWindow.setFeatures(response);
                    self_cw.map.infoWindow.show(center);
                    self_cw.map.setExtent(ext.expand(1.6), true);
                },
                function(error) {
                    self_cw._showMessage(`${self_cw.nls.error_query_feature} ${self_cw.feature_dm.title} (${query.where})\n${error.message}`);
                }
            );
        }, function(error) {
            self_cw._showMessage(`${self_cw.nls.error_query_feature} ${self_cw.feature_dm.title} (${query.where})\n${error.message}`);
        });
    },

    startup() {
        this.inherited(arguments);
        console.log('Consulta_wgt::startup');
        this.busyIndicator = BusyIndicator.create({
            target: this.domNode.parentNode.parentNode.parentNode,
            backgroundOpacity: 0
        });
        this.busyIndicator.show();

        // var panel = this.getPanel();
        // var pos = panel.position;
        // pos.width = 450;
        // panel.setPosition(pos);
        // panel.panelManager.normalizePanel(panel);


        self_cw._addEventToTabsOptions();
        self_cw._addEventToLayerQuery();
        self_cw._getDataByTipoPersona();
        self_cw._getDataByDepartamento()
        this.busyIndicator.hide();
    },
    onOpen() {
        console.log('Consulta_wgt::onOpen');
    },

    _cleanMap() {
        this.busyIndicator.show()
            // this.map.graphics.clear();
        let whereDefinition = '1=1'
        lyr_dc = this.layersMap.getLayerInfoById(this.config.layer_id_dc);
        lyr_dm = this.layersMap.getLayerInfoById(this.config.layer_id_dm);
        lyr_dc.hide();
        lyr_dm.hide();
        lyr_dc.setFilter(whereDefinition);
        lyr_dm.setFilter(whereDefinition);
        this.busyIndicator.hide()
        this.container_resultados_opcion_cw.classList.remove('active');
        this.ap_none_resultados_opcion_cw.hidden = false;
        this.controller_layer_query = false;
    },

    onClose() {
        console.log('Consulta_wgt::onClose');
        if (this.controller_layer_query) {
            this._showMessage(this.nls.clean_map_question, type = 'question')
        }
    },
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

    _queryDcGeneral() {
        let query = new Query();
        query.where = self_cw.whereDefinition;
        // var feature_dc = self_cw.layersMap.getLayerInfoById(self_cw.config.layer_id_dc);
        self_cw.feature_dc.hide();
        self_cw.feature_dc.setFilter('');
        self_cw.feature_dc_table.getLayerObject().then(
                function(response) {
                    response.queryCount(query, function(results) {
                        self_cw.numero_registros = results
                        self_cw.ap_indicador_resultados_cw.innerText = results;
                        self_cw.ap_titulo_resultados_cw.innerText = self_cw.titulo_consulta.innerText + ' encontrados';

                        self_cw._generatePages();
                        self_cw._queryDcByPage();
                    }, function(error) {
                        self_cw._showMessage(error.message, type = 'error')
                    })
                })
            .catch((error) => {
                self_cw._showMessage(error.message, type = 'error')
                self_cw.busyIndicator_lw.hide();
            });
    },

    queryDmGeneral() {
        let query = new Query();
        query.where = self_cw.whereDefinition;
        self_cw.feature_dm.hide();
        self_cw.feature_dm.setFilter('');
        self_cw.feature_dm.getLayerObject()
            .then(
                function(response) {
                    response.queryIds(query, function(results) {
                        // console.log(results);
                        self_cw.numero_registros = results.length
                        self_cw.ap_indicador_resultados_cw.innerText = results.length;
                        self_cw.ap_titulo_resultados_cw.innerText = self_cw.titulo_consulta.innerText + ' encontrados';

                        self_cw._generatePages();
                        self_cw._queryDmByPage();
                        // self_cw.busyIndicator.hide();
                    }, function(error) {
                        self_cw._showMessage(error.message, type = 'error')
                    })
                })
            .catch((error) => {
                self_cw._showMessage(error.message, type = 'error')
                self_cw.busyIndicator_lw.hide();
            });
    },

    _queryDcByPage(n = 1) {
        // self_cw.feature_dc_sys.hide();
        self_cw.busyIndicator.show();

        if (self_cw.numero_registros == 0) {
            self_cw.busyIndicator.hide();
            self_cw.ap_titulo_registros_resultados_cw.innerText = '';
            self_cw.ap_resultados_cw.click();
            return;
        };

        let query = new Query();
        query.returnGeometry = false;
        query.where = self_cw.whereDefinition;
        query.num = self_cw.registros_pagina;
        query.start = n == 1 ? 0 : (n - 1) * self_cw.registros_pagina;
        query.orderByFields = [self_cw.field_id];

        var start = query.start + 1
        var fin = query.start + query.num > self_cw.numero_registros ? self_cw.numero_registros : self_cw.pagina_actual * query.num
        self_cw.ap_titulo_registros_resultados_cw.innerText = String(start) + ' - ' + String(fin)

        self_cw.feature_dc.hide();
        self_cw.feature_dc.setFilter('');

        // Realizando el query a la capa
        self_cw.feature_dc_table.layerObject.queryFeatures(query, function(result) {
            var rowcount = result.features.length;
            if (rowcount) {
                self_cw.controller_layer_query = true;
            }
            // self_cw.ap_indicador_resultados_cw.innerText = rowcount;
            // self_cw.ap_titulo_resultados_cw.innerText = self_cw.titulo_consulta.innerText + ' encontrados';

            var data = result.features.map((i) => i.attributes);

            let ids = data.map((i) => i[self_cw.field_id])
            let ids_join = ids.join(', ')
            let query_ids = self_cw.field_id + ' IN (' + ids_join + ')'


            self_cw.feature_dc.setFilter(query_ids);
            self_cw.feature_dc.show();

            // self_cw.feature_dc_sys.setFilter(query_ids);
            // self_cw.feature_dc_sys.show();

            self_cw._populateResultsDC(data, start)

            self_cw.ap_none_resultados_opcion_cw.hidden = true;
            var class_list_container_resultados = self_cw.container_resultados_opcion_cw.classList;
            if (!class_list_container_resultados.contains('active')) {
                self_cw.container_resultados_opcion_cw.classList.toggle('active');
            }
            self_cw.ap_resultados_cw.click();
            self_cw.busyIndicator.hide();
        });

        self_cw.feature_dc.layerObject.queryExtent(query, (results) => {
            if (results.count) {
                self_cw.map.setExtent(results.extent, true);
            }
        });

        if (self_cw.numero_paginas <= 1) {
            self_cw.ap_anterior_page_cw.setAttribute('disabled', true)
            self_cw.ap_siguiente_page_cw.setAttribute('disabled', true)
            return;
        }

        if (n == 1) {
            self_cw.ap_anterior_page_cw.setAttribute('disabled', true)
            self_cw.ap_siguiente_page_cw.removeAttribute('disabled')
        } else if (n == self_cw.numero_paginas) {
            self_cw.ap_anterior_page_cw.removeAttribute('disabled')
            self_cw.ap_siguiente_page_cw.setAttribute('disabled', true)
        } else {
            self_cw.ap_anterior_page_cw.removeAttribute('disabled')
            self_cw.ap_siguiente_page_cw.removeAttribute('disabled')
        }

    },

    _queryDmByPage(n = 1) {
        // self_cw.feature_dc_sys.hide();
        self_cw.busyIndicator.show();

        if (self_cw.numero_registros == 0) {
            self_cw.busyIndicator.hide();
            self_cw.ap_titulo_registros_resultados_cw.innerText = '';
            self_cw.ap_resultados_cw.click();
            return;
        };

        let query = new Query();
        query.where = self_cw.whereDefinition;
        query.returnGeometry = false;
        query.num = self_cw.registros_pagina;
        query.start = n == 1 ? 0 : (n - 1) * self_cw.registros_pagina;
        query.orderByFields = [self_cw.field_codigou_dm];

        var start = query.start + 1
        var fin = query.start + query.num > self_cw.numero_registros ? self_cw.numero_registros : self_cw.pagina_actual * query.num
        self_cw.ap_titulo_registros_resultados_cw.innerText = String(start) + ' - ' + String(fin)

        self_cw.feature_dm.hide();
        self_cw.feature_dm.setFilter('');

        // Realizando el query a la capa
        self_cw.feature_dm.layerObject.queryFeatures(query, function(result) {
            let rowcount = result.features.length;
            if (rowcount) {
                self_cw.controller_layer_query = true;
            }

            let data = result.features.map((i) => i.attributes);

            let ids = data.map((i) => i[self_cw.field_codigou_dm])
            let ids_join = ids.join("', '")
            let query_ids = self_cw.field_codigou_dm + " IN ('" + ids_join + "')"


            self_cw.feature_dm.setFilter(query_ids);
            self_cw.feature_dm.show();

            self_cw._populateResultsDM(data, start);

            self_cw.ap_none_resultados_opcion_cw.hidden = true;
            var class_list_container_resultados = self_cw.container_resultados_opcion_cw.classList;
            if (!class_list_container_resultados.contains('active')) {
                self_cw.container_resultados_opcion_cw.classList.toggle('active');
            }
            self_cw.ap_resultados_cw.click();
            self_cw.busyIndicator.hide();
        });

        self_cw.feature_dm.layerObject.queryExtent(query, (results) => {
            if (results.count) {
                self_cw.map.setExtent(results.extent, true);
            }
        });

        if (self_cw.numero_paginas <= 1) {
            self_cw.ap_anterior_page_cw.setAttribute('disabled', true)
            self_cw.ap_siguiente_page_cw.setAttribute('disabled', true)
            return;
        }

        if (n == 1) {
            self_cw.ap_anterior_page_cw.setAttribute('disabled', true)
            self_cw.ap_siguiente_page_cw.removeAttribute('disabled')
        } else if (n == self_cw.numero_paginas) {
            self_cw.ap_anterior_page_cw.removeAttribute('disabled')
            self_cw.ap_siguiente_page_cw.setAttribute('disabled', true)
        } else {
            self_cw.ap_anterior_page_cw.removeAttribute('disabled')
            self_cw.ap_siguiente_page_cw.removeAttribute('disabled')
        }
    },

    _queryDcByPageEvent(evt) {
        // Obtiene el numero de la pagina
        let page = evt.target.innerText;

        self_cw.pagina_actual = parseInt(page);
        self_cw.ap_registros_encontrados_cw.innerHTML = '';

        // Filtro de elementos
        self_cw._queryDcByPage(self_cw.pagina_actual);

        // Remover la pagina anterior seleccionada
        dojo.query('.is-current').toggleClass('is-current');

        // Activar la pagina actual seleccionada
        evt.target.classList.toggle('is-current')
    },

    _queryDmByPageEvent(evt) {
        // Obtiene el numero de la pagina
        let page = evt.target.innerText;

        self_cw.pagina_actual = parseInt(page);
        self_cw.ap_registros_encontrados_cw.innerHTML = '';

        // Filtro de elementos
        self_cw._queryDmByPage(self_cw.pagina_actual);

        // Remover la pagina anterior seleccionada
        dojo.query('.is-current').toggleClass('is-current');

        // Activar la pagina actual seleccionada
        evt.target.classList.toggle('is-current')
    },

    _nextPage(evt) {
        self_cw.pagina_actual = self_cw.pagina_actual == self_cw.numero_paginas ? self_cw.pagina_actual : self_cw.pagina_actual + 1;

        if (!self_cw.grupos_paginas[self_cw.grupo_actual].includes(self_cw.pagina_actual)) {
            self_cw.grupo_actual = self_cw.grupo_actual == self_cw.grupos_paginas.length - 1 ? self_cw.grupo_actual : self_cw.grupo_actual + 1;
            self_cw._generatePagesFromArray(self_cw.grupos_paginas[self_cw.grupo_actual], self_cw.pagina_actual)
        }
        dojo.query(`#page_${self_cw.pagina_actual}_cw`)[0].click();
    },

    _backPage(evt) {
        self_cw.pagina_actual = self_cw.pagina_actual == 1 ? self_cw.pagina_actual : self_cw.pagina_actual - 1;
        if (!self_cw.grupos_paginas[self_cw.grupo_actual].includes(self_cw.pagina_actual)) {
            self_cw.grupo_actual = self_cw.grupo_actual == 0 ? self_cw.grupo_actual : self_cw.grupo_actual - 1;
            self_cw._generatePagesFromArray(self_cw.grupos_paginas[self_cw.grupo_actual], self_cw.pagina_actual)
        }
        dojo.query(`#page_${self_cw.pagina_actual}_cw`)[0].click();
    },

    _generatePages() {
        if (self_cw.numero_registros == 0) {
            self_cw.ap_pagination_cw.classList.remove('paginationActive');
            self_cw.ap_pagination_list_cw.innerHTML = '';
            self_cw.busyIndicator.hide();
            return
        }
        if (!self_cw.ap_pagination_cw.classList.contains('paginationActive')) {
            self_cw.ap_pagination_cw.classList.add('paginationActive');
        }
        self_cw.numero_paginas = Math.ceil(self_cw.numero_registros / self_cw.registros_pagina);
        self_cw.grupos_paginas = self_cw._generateGroupsPages(self_cw.numero_paginas, self_cw.factor);
        self_cw.grupo_actual = 0 // Es el primer grupo
        self_cw.pagina_actual = 1 // Segundo parametro es 1 porque es la primera pagina

        self_cw._generatePagesFromArray(self_cw.grupos_paginas[self_cw.grupo_actual], self_cw.pagina_actual);
    },

    _generateGroupsPages(numero_paginas, factor) {
        let paginas = Array.from(Array(numero_paginas + 1).keys()).slice(1);
        let grupos = Math.ceil(numero_paginas / factor);
        var grupos_array = Array.from(Array(grupos).keys());
        let grupos_paginas = grupos_array.map((i) => paginas.slice(i * factor, (i + 1) * factor));
        return grupos_paginas;
    },

    _generatePagesFromArray(pages, val) {
        let pages_html_array = [];
        pages.forEach(function(n) {
            let class_element = n == val ? 'pagination-link is-current pages_result_cw' : 'pagination-link pages_result_cw'
            pages_html_array.push(`<li><a id="page_${n}_cw" class="${class_element}" aria-label="Pagina ${n}">${n}</a></li>`)
        });

        if (self_cw.grupo_actual == 0 && self_cw.grupos_paginas.length == 1) {
            // No hace nada
        } else if (self_cw.grupo_actual == 0 && self_cw.grupos_paginas.length > 1) {
            pages_html_array.push('<li><span class="pagination-ellipsis">&hellip;</span></li>')
        } else if (self_cw.grupo_actual == self_cw.grupos_paginas.length - 1) {
            pages_html_array.splice(0, 0, '<li><span class="pagination-ellipsis">&hellip;</span></li>');
        } else {
            pages_html_array.push('<li><span class="pagination-ellipsis">&hellip;</span></li>');
            pages_html_array.splice(0, 0, '<li><span class="pagination-ellipsis">&hellip;</span></li>');
        }

        pages_html = pages_html_array.join('');
        self_cw.ap_pagination_list_cw.innerHTML = pages_html;

        if (self_cw.controller_query == 'dc') {
            dojo.query('.pages_result_cw').on('click', self_cw._queryDcByPageEvent);
        } else if (self_cw.controller_query == 'dm') {
            dojo.query('.pages_result_cw').on('click', self_cw._queryDmByPageEvent);
        }
    },

    _applyQueryDC2() {
        self_cw.feature_dm.hide();
        let whereDefinitionArray = [];
        self_cw.whereDefinition = '';

        let ruc_dc = `(${self_cw.field_m_ruc} is not null)`;

        if (self_cw.input_ruc_dc_cw.value != '') {
            ruc_dc = `(${self_cw.field_m_ruc} like '%${self_cw.input_ruc_dc_cw.value}%' and ${ruc_dc})`;
        }

        whereDefinitionArray.push(ruc_dc);

        let nombre_dc = `(lower(${self_cw.field_minero_informal}) like lower('%${self_cw.input_nombre_dc_cw.value}%'))`;
        whereDefinitionArray.push(nombre_dc);

        if (self_cw.select_tipo_persona_cw.value != '') {
            let tipo_persona_dc = `(${self_cw.field_tipo_persona} like '%${self_cw.select_tipo_persona_cw.value}%')`;
            whereDefinitionArray.push(tipo_persona_dc);
        };

        let codigou_dc = `(upper(${self_cw.field_id_unidad}) like upper('%${self_cw.input_codigou_dc_cw.value}%'))`;
        whereDefinitionArray.push(codigou_dc);

        let nombredm_dc = `(lower(${self_cw.field_derecho_minero}) like lower('%${self_cw.input_nombre_dm_dc_cw.value}%'))`;
        whereDefinitionArray.push(nombredm_dc);

        let ubigeo_dc = `(${self_cw.field_id_ubigeo_inei} like '${self_cw.controller_ubigeo}%')`;
        whereDefinitionArray.push(ubigeo_dc);

        self_cw.whereDefinition = whereDefinitionArray.join(' and ');
        self_cw._queryDcGeneral();
    },

    _applyQueryDM2() {
        self_cw.feature_dc.hide();
        let whereDefinitionArray = []
        self_cw.whereDefinition = ''

        var codigou_dm = `(upper(${self_cw.field_codigou_dm}) like upper('%${self_cw.input_codigou_dm_cw.value}%'))`;
        whereDefinitionArray.push(codigou_dm)

        var nombredm_dm = `(lower(${self_cw.field_concesion_dm}) like lower('%${self_cw.input_nombre_dm_cw.value}%'))`;
        whereDefinitionArray.push(nombredm_dm)

        self_cw.whereDefinition = whereDefinitionArray.join(' and ');

        self_cw.queryDmGeneral();
    },
});