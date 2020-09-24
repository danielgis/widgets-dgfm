import declare from 'dojo/_base/declare';
import BaseWidget from 'jimu/BaseWidget';

// To create a widget, you need to derive from BaseWidget.
export default declare([BaseWidget], {

  // Custom widget code goes here

  baseClass: 'presentacion-wgt',

  // add additional properties here

  // methods to communication with app container:
  postCreate () {
    this.inherited(arguments);
    console.log('presentacion_wgt::postCreate');
  }
  // startup() {
  //   this.inherited(arguments);
  //   console.log('presentacion_wgt::startup');
  // },
  // onOpen() {
  //   console.log('presentacion_wgt::onOpen');
  // },
  // onClose(){
  //   console.log('presentacion_wgt::onClose');
  // },
  // onMinimize(){
  //   console.log('presentacion_wgt::onMinimize');
  // },
  // onMaximize(){
  //   console.log('presentacion_wgt::onMaximize');
  // },
  // onSignIn(credential){
  //   console.log('presentacion_wgt::onSignIn', credential);
  // },
  // onSignOut(){
  //   console.log('presentacion_wgt::onSignOut');
  // }
  // onPositionChange(){
  //   console.log('presentacion_wgt::onPositionChange');
  // },
  // resize(){
  //   console.log('presentacion_wgt::resize');
  // }
});
