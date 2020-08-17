import declare from 'dojo/_base/declare';
import BaseWidgetSetting from 'jimu/BaseWidgetSetting';

export default declare([BaseWidgetSetting], {
  baseClass: 'consulta-wgt-setting',

  postCreate () {
    // the config object is passed in
    this.setConfig(this.config);
  },

  setConfig (config) {
    this.textNode.value = config.serviceUrl;
  },

  getConfig () {
    // WAB will get config object through this method
    return {
      serviceUrl: this.textNode.value
    };
  }
});
