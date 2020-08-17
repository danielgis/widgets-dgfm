import declare from 'dojo/_base/declare';
import BaseWidget from 'jimu/BaseWidget';

// To create a widget, you need to derive from BaseWidget.
export default declare([BaseWidget], {

  // Custom widget code goes here

  baseClass: 'reporte-wgt',

  // add additional properties here

  // methods to communication with app container:
  postCreate () {
    this.inherited(arguments);
    console.log('Reporte_wgt::postCreate');
  }
  // startup() {
  //   this.inherited(arguments);
  //   console.log('Reporte_wgt::startup');
  // },
  // onOpen() {
  //   console.log('Reporte_wgt::onOpen');
  // },
  // onClose(){
  //   console.log('Reporte_wgt::onClose');
  // },
  // onMinimize(){
  //   console.log('Reporte_wgt::onMinimize');
  // },
  // onMaximize(){
  //   console.log('Reporte_wgt::onMaximize');
  // },
  // onSignIn(credential){
  //   console.log('Reporte_wgt::onSignIn', credential);
  // },
  // onSignOut(){
  //   console.log('Reporte_wgt::onSignOut');
  // }
  // onPositionChange(){
  //   console.log('Reporte_wgt::onPositionChange');
  // },
  // resize(){
  //   console.log('Reporte_wgt::resize');
  // }
});
