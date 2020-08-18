import declare from 'dojo/_base/declare';
import BaseWidget from 'jimu/BaseWidget';
import query from "dojo/query";
import lang from 'dojo/_base/lang';
import LayerInfos from 'jimu/LayerInfos/LayerInfos';
import Query from "esri/tasks/query";
import QueryTask from "esri/tasks/QueryTask";
import StatisticDefinition from "esri/tasks/StatisticDefinition";
// import on from 'dojo/on';
// import domClass from "dojo/dom-class";
// import "dojo/domReady!";

// To create a widget, you need to derive from BaseWidget.
export default declare([BaseWidget, query, Query,
    QueryTask,
    StatisticDefinition
], {

    // Custom widget code goes here

    baseClass: 'consulta-wgt',
    iniClause: '1=1',
    field_dc_tipo_persona: 'TIPO_PERSONA',
    layersMap: [],

    field_dep_nm_depa: 'NM_DEPA',
    field_dep_cd_depa: 'CD_DEPA',

    field_prov_nm_prov: 'NM_PROV',
    field_prov_cd_prov: 'CD_PROV',

    field_dist_nm_dist: 'NM_DIST',
    field_dist_cd_dist: 'CD_DIST',

    controller_query: '', // Permite identificar la opcion de consulta seleccionada

    controller_ubigeo: '',

    // add additional properties here

    // methods to communication with app container:
    postCreate() {
        self_cw = this;
        this.inherited(arguments);
        // console.log('Consulta_wgt::postCreate');;
        this._getAllLayers();
    },

    _getAllLayers() {
        _layerInfosObjClone = []
        LayerInfos.getInstance(this.map, this.map.itemInfo)
            .then(lang.hitch(this, function(layerInfosObj) {
                this.layersMap = layerInfosObj;
            }));
    },
    // Metodos para agregar opciones a las etiquetas 'select'

    _getDataByTipoPersona() {
        var id = self_cw.config.layer_id_dc
        var feature_dc = this.layersMap.getLayerInfoById(id);
        var queryTask = new QueryTask(feature_dc.getUrl());
        var query = new Query();
        query.where = `${self_cw.field_dc_tipo_persona} IS NOT NULL`;
        query.returnGeometry = false;
        query.returnDistinctValues = true;
        query.outFields = [self_cw.field_dc_tipo_persona];
        queryTask.execute(query, function(results) {
            var result_options = results.features.map((i) => i.attributes[self_cw.field_dc_tipo_persona]);
            result_options.forEach(element => {
                opt = document.createElement("option");
                opt.value = element;
                opt.text = element;
                self_cw.select_tipo_persona_cw.add(opt);
            })
            opt = document.createElement("option");
            opt.value = '';
            opt.text = 'Todos';
            opt.selected = true;
            self_cw.select_tipo_persona_cw.add(opt);
        });
    },

    _getDataByDepartamento() {
        var id = self_cw.config.layer_id_dep
        var feature_dep = this.layersMap.getLayerInfoById(id);
        var queryTask = new QueryTask(feature_dep.getUrl());
        var query = new Query();
        query.where = `${self_cw.field_dep_cd_depa} <> 99`;
        query.returnGeometry = false;
        query.outFields = [self_cw.field_dep_nm_depa, self_cw.field_dep_cd_depa];
        query.orderByFields = [self_cw.field_dep_nm_depa];
        queryTask.execute(query, function(results) {
            var result_options = results.features.map((i) => i.attributes);
            result_options.forEach(element => {
                opt = document.createElement("option");
                opt.value = element[self_cw.field_dep_cd_depa];
                opt.text = element[self_cw.field_dep_nm_depa];
                self_cw.departamento_cw.add(opt);
            })
            opt = document.createElement("option");
            opt.value = '';
            opt.text = 'Todos';
            opt.selected = true;
            self_cw.departamento_cw.add(opt);
        })
    },

    _getDataByProvincia(evt) {
        var cd_depa = evt.target.value;
        self_cw.controller_ubigeo = cd_depa;
        if (cd_depa == '') {
            self_cw.container_provincia_cw.classList.remove('active');
            self_cw.container_distrito_cw.classList.remove('active');
            return
        }
        var id = self_cw.config.layer_id_prov
        var feature_prov = this.layersMap.getLayerInfoById(id);
        var queryTask = new QueryTask(feature_prov.getUrl());
        var query = new Query();
        query.where = `${self_cw.field_dep_cd_depa} = '${cd_depa}'`;
        query.returnGeometry = false;
        query.outFields = [self_cw.field_prov_nm_prov, self_cw.field_prov_cd_prov];
        query.orderByFields = [self_cw.field_prov_nm_prov];
        queryTask.execute(query, function(results) {
            self_cw.provincia_cw.innerHTML = "";
            var result_options = results.features.map((i) => i.attributes);
            result_options.forEach(element => {
                opt = document.createElement("option");
                opt.value = element[self_cw.field_prov_cd_prov];
                opt.text = element[self_cw.field_prov_nm_prov];
                self_cw.provincia_cw.add(opt);
            })
            opt = document.createElement("option");
            opt.value = '';
            opt.text = 'Todos';
            // opt.selected = true;
            self_cw.provincia_cw.add(opt);
        });
        if (!self_cw.container_provincia_cw.classList.contains('active')) {
            self_cw.container_provincia_cw.classList.toggle('active');
        }
    },

    _getDataByDistrito(evt) {
        var cd_prov = evt.target.value;
        self_cw.controller_ubigeo = cd_prov;
        if (cd_prov == '') {
            self_cw.container_distrito_cw.classList.remove('active')
            return
        }
        var id = self_cw.config.layer_id_dist
        var feature_dist = this.layersMap.getLayerInfoById(id);
        var queryTask = new QueryTask(feature_dist.getUrl());
        var query = new Query();
        query.where = `${self_cw.field_prov_cd_prov} = '${cd_prov}'`;
        query.returnGeometry = false;
        query.outFields = [self_cw.field_dist_nm_dist, self_cw.field_dist_cd_dist];
        query.orderByFields = [self_cw.field_dist_nm_dist];
        queryTask.execute(query, function(results) {
            self_cw.distrito_cw.innerHTML = "";
            var result_options = results.features.map((i) => i.attributes);
            result_options.forEach(element => {
                opt = document.createElement("option");
                opt.value = element[self_cw.field_dist_cd_dist];
                opt.text = element[self_cw.field_dist_nm_dist];
                self_cw.distrito_cw.add(opt);
            })
            opt = document.createElement("option");
            opt.value = 0;
            opt.text = 'Todos';
            // opt.selected = true;
            self_cw.distrito_cw.add(opt);
        });
        if (!self_cw.container_distrito_cw.classList.contains('active')) {
            self_cw.container_distrito_cw.classList.toggle('active');
        }
    },

    _getDistritoSelected(evt) {
        var cd_dist = evt.target.value;
        self_cw.controller_ubigeo = cd_dist;
    },

    // Metodos dedicados al frontend del widget

    _addEventToLayerQuery() {
        dojo.query(".capa_consulta_cw").on('click', self_cw._setFormContainer);
    },

    _setFormContainer(evt) {
        var title = evt.currentTarget.innerText;
        // var id = evt.currentTarget.id;
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
        var nodeContainer_cw = query(".container_cw");
        dojo.toggleClass(nodeContainer_cw[0], 'active');
        self_cw.ListaCapasConsulta.hidden = false;
    },

    _addEventToTabsOptions() {
        dojo.query('.opcion_cw').on('click', self_cw._connectTabsWithOptionContainer)
    },

    _connectTabsWithOptionContainer(evt) {
        var option = evt.currentTarget.innerText.toLowerCase();
        if (evt.currentTarget.classList.contains('is-active')) {
            return
        };
        query('.opcion_cw').forEach(function(node) {
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


    // Proceso que realiza la consulta
    _applyQuery(evt) {
        switch (self_cw.controller_query) {
            case 'dc':
                self_cw._applyQueryDC();
                // console.log('Ejecutando proces dc');
                break;
            case 'dm':
                self_cw._applyQueryDM();
                // console.log('Ejecutando proces dm');
                break;
            default:
                break;
        }
    },

    _applyQueryDC() {
        whereDefinitionArray = []

        var ruc_dc = `(m_ruc like '%${self_cw.input_ruc_dc_cw.value}%')`;
        var nombre_dc = `(lower(minero_informal) like lower('%${self_cw.input_nombre_dc_cw.value}%'))`;
        var codigou_dc = `(upper(id_unidad) like upper('%${self_cw.input_codigou_dc_cw.value}%'))`;
        var nombredm_dc = `(lower(derecho_minero) like lower('%${self_cw.input_nombre_dm_dc_cw.value}%'))`;
        var ubigeo_dc = `(id_ubigeo_inei like '${self_cw.controller_ubigeo}%')`;

        whereDefinitionArray.push(ruc_dc)
        whereDefinitionArray.push(nombre_dc)
        whereDefinitionArray.push(codigou_dc)
        whereDefinitionArray.push(nombredm_dc)
        whereDefinitionArray.push(ubigeo_dc)

        var whereDefinition = whereDefinitionArray.join(' and ');


        console.log(whereDefinition);

        // query
        // List results
        // Change view results
        // Open popup when click list
    },

    _applyQueryDM() {
        whereDefinitionArray = []
        var codigou_dm = `(upper(id_unidad) like upper('%${self_cw.input_codigou_dm_cw.value}%'))`;
        var nombredm_dm = `(lower(derecho_minero) like lower('%${self_cw.input_nombre_dm_cw.value}%'))`;
        whereDefinitionArray.push(codigou_dm)
        whereDefinitionArray.push(nombredm_dm)

        var whereDefinition = whereDefinitionArray.join(' and ');

        console.log(whereDefinition);

        // query
        // List results
        // Add number reinfos by dm
        // Change view results
        // Open popup when click list
    },

    startup() {
        this.inherited(arguments);
        console.log('Consulta_wgt::startup');
        self_cw._addEventToTabsOptions();
        self_cw._addEventToLayerQuery();
        self_cw._getDataByTipoPersona();
        self_cw._getDataByDepartamento()
    },
    onOpen() {
        console.log('Consulta_wgt::onOpen');
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