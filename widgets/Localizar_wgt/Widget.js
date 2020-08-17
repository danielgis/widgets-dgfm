import declare from 'dojo/_base/declare';
import BaseWidget from 'jimu/BaseWidget';

// To create a widget, you need to derive from BaseWidget.
export default declare([BaseWidget], {

  // Custom widget code goes here

  baseClass: 'localizar-wgt',

  // add additional properties here

  // methods to communication with app container:
  postCreate () {
    this.inherited(arguments);
    console.log('Localizar_wgt::postCreate');
  }
  // startup() {
  //   this.inherited(arguments);
  //   console.log('Localizar_wgt::startup');
  // },
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
