import declare from 'dojo/_base/declare';
import BaseWidget from 'jimu/BaseWidget';
import lang from 'dojo/_base/lang';
import LayerInfos from 'jimu/LayerInfos/LayerInfos';
import Query from "esri/tasks/query";
import QueryTask from "esri/tasks/QueryTask";
import StatisticDefinition from "esri/tasks/StatisticDefinition";
import on from 'dojo/on';
import '../../libs/chartjs/chartjs-plugin-labels'

// To create a widget, you need to derive from BaseWidget.
export default declare([
    BaseWidget,
    Query,
    QueryTask,
    StatisticDefinition
], {

    // Custom widget code goes here

    baseClass: 'estadisticas-wgt',

    // add additional properties here
    layersMap: [],
    iniClause: '1=1',

    // Elementos del grafico de barras vertical
    // feature_id_vertical_bar: '',
    field_x_vertical_bar: 'DEPA',
    field_y_vertical_bar: 'COUNTDEPA',
    label_y_vertical_bar: 'Numero de Reinfos',

    // Elementos del gráfico de torta
    // feature_id_vertical_bar: '',
    field_x_pie: 'LEYENDA',
    field_y_pie: 'COUNTLEYENDA',
    label_y_pie: 'Tipo de persona',

    // Elementos del grafico de barras horizontal
    // feature_id_vertical_bar: '',
    field_x_horizontal_bar: 'LEYENDA',
    field_y_horizontal_bar: 'COUNTLEYENDA',
    label_y_horizontal_bar: 'Origen',


    // methods to communication with app container:
    postCreate() {
        self = this;
        this._getAllLayers();
        this._drawVerticalBarChart();
        this._drawPieChart();
        this._drawHorizontalBarChart();

    },

    _getAllLayers() {
        // _layerInfosObjClone = []
        LayerInfos.getInstance(this.map, this.map.itemInfo)
            .then(lang.hitch(this, function(layerInfosObj) {
                this.layersMap = layerInfosObj;
            }));
    },

    _drawVerticalBarChart() {
        var id = this.config.service_id_vertical_bar;
        var feature = this.layersMap.getLayerInfoById(id);
        var url = feature.getUrl();

        var queryTask = new QueryTask(url);
        var query = new Query();

        // Eliminar la siguiente linea en produccion
        this.iniClause = self.field_x_vertical_bar + " NOT LIKE '%/%'";

        query.where = this.iniClause;
        query.groupByFieldsForStatistics = [self.field_x_vertical_bar];

        var countStatDef = new StatisticDefinition();
        countStatDef.statisticType = "count";
        countStatDef.onStatisticField = self.field_x_vertical_bar;
        countStatDef.outStatisticFieldName = self.field_y_vertical_bar;

        query.orderByFields = [`COUNT(${self.field_x_vertical_bar}) DESC`]

        query.outStatistics = [countStatDef];

        queryTask.execute(query, function(results) {
            x = results.features.map((i) => i.attributes[self.field_x_vertical_bar]);
            y = results.features.map((i) => i.attributes[self.field_y_vertical_bar]);
            self._VerticalBarChart(x, y);
        });

    },

    _VerticalBarChart(x, y) {
        var ctx = self.VerticalBarAp.getContext('2d');
        ctx.canvas.height = 500;
        var myChart = new Chart(ctx, {
            type: 'horizontalBar',
            data: {
                labels: x,
                datasets: [{
                    label: self.label_y_vertical_bar,
                    data: y,
                    borderWidth: 1,
                    backgroundColor: '#36a2eb'
                }]
            },
            options: {
                legend: {
                    display: false,
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                },
                plugins: {
                    labels: {
                        render: 'value',
                    }
                }
            }
        });
    },

    _drawPieChart() {
        var id = this.config.service_id_pie;
        var feature = this.layersMap.getLayerInfoById(id);
        var url = feature.getUrl();

        var queryTask = new QueryTask(url);
        var query = new Query();

        // Eliminar la siguiente linea en produccion
        // this.iniClause = self.field_x_vertical_bar + " NOT LIKE '%/%'";

        query.where = this.iniClause;
        query.groupByFieldsForStatistics = [self.field_x_pie];

        var countStatDef = new StatisticDefinition();
        countStatDef.statisticType = "count";
        countStatDef.onStatisticField = self.field_x_pie;
        countStatDef.outStatisticFieldName = self.field_y_pie;

        query.outStatistics = [countStatDef];

        queryTask.execute(query, function(results) {
            x = results.features.map((i) => i.attributes[self.field_x_pie]);
            y = results.features.map((i) => i.attributes[self.field_y_pie]);
            self._pieChart(x, y);
        });
    },

    _pieChart(x, y) {
        var ctx = self.PieAp.getContext('2d');
        ctx.canvas.height = 250;
        var myPieChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: x,
                datasets: [{
                    label: self.label_y_pie,
                    data: y,
                    backgroundColor: [
                        'rgb(255, 99, 132)',
                        '#91d18b',
                        'rgb(54, 162, 235)',
                        'rgb(255, 205, 86)',
                        '#fff48f',
                    ],
                    hoverOffset: 4
                }]
            },
            // plugins: [ChartDataLabels],
            options: {
                responsive: true,
                animation: {
                    animateScale: true,
                    animateRotate: true
                },
                plugins: {
                    labels: {
                        render: 'value',
                    }
                }
            }
        });
    },

    _drawHorizontalBarChart() {
        var id = this.config.service_id_horizontal_bar;
        var feature = this.layersMap.getLayerInfoById(id);
        var url = feature.getUrl();

        var queryTask = new QueryTask(url);
        var query = new Query();

        // Eliminar la siguiente linea en produccion
        // this.iniClause = self.field_x_vertical_bar + " NOT LIKE '%/%'";

        query.where = this.iniClause;
        query.groupByFieldsForStatistics = [self.field_x_horizontal_bar];

        var countStatDef = new StatisticDefinition();
        countStatDef.statisticType = "count";
        countStatDef.onStatisticField = self.field_x_horizontal_bar;
        countStatDef.outStatisticFieldName = self.field_y_horizontal_bar;

        query.outStatistics = [countStatDef];

        queryTask.execute(query, function(results) {
            x = results.features.map((i) => i.attributes[self.field_x_horizontal_bar]);
            y = results.features.map((i) => i.attributes[self.field_y_horizontal_bar]);
            self._HorizontalBarChart(x, y);
        });

    },

    _HorizontalBarChart(x, y) {
        var ctx = self.HorizontalBarAp.getContext('2d');
        ctx.canvas.height = 250;
        var myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: x,
                datasets: [{
                    label: self.label_y_horizontal_bar,
                    data: y,
                    backgroundColor: [
                        'rgb(255, 99, 132)',
                        '#91d18b',
                        'rgb(54, 162, 235)',
                        'rgb(255, 205, 86)',
                        '#fff48f',
                    ],
                    borderWidth: 1,
                }]
            },
            options: {
                legend: {
                    display: false,
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                },
                plugins: {
                    labels: {
                        render: 'value',
                    }
                }
            }
        });
    },

    _acordeonFunction(evt) {
        evt.target.classList.toggle("active");
        var panel = evt.target.nextElementSibling;
        panel.classList.toggle("active");
        // if (panel.style.maxHeight) {
        //     panel.style.maxHeight = null;
        // } else {
        //     panel.style.maxHeight = panel.scrollHeight + "px";
        // }
    },
    startup() {
        this.inherited(arguments);
        // console.log('Estadisticas_wgt::startup');

    },
    // onOpen() {
    //     console.log('Estadisticas_wgt::onOpen');
    // },
    // onClose(){
    //   console.log('Estadisticas_wgt::onClose');
    // },
    // onMinimize(){
    //   console.log('Estadisticas_wgt::onMinimize');
    // },
    // onMaximize(){
    //   console.log('Estadisticas_wgt::onMaximize');
    // },
    // onSignIn(credential){
    //   console.log('Estadisticas_wgt::onSignIn', credential);
    // },
    // onSignOut(){
    //   console.log('Estadisticas_wgt::onSignOut');
    // }
    // onPositionChange(){
    //   console.log('Estadisticas_wgt::onPositionChange');
    // },
    // resize(){
    //   console.log('Estadisticas_wgt::resize');
    // }
});