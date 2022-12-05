const MiHumidifierJSQ4 = require('./MiHumidifierJSQ4');

module.exports = class {

  static adapterVersionMap = {
    'jsq4': function(log, config, api) {
      return new MiHumidifierJSQ4(log, config, api);
    },
  };

  static create(log, config, api) {
    if (config.model in this.adapterVersionMap) {
      log.info('Adapter supported model: ', config.model);
      return this.adapterVersionMap[config.model](log, config, api);
    }
    log.info('Adapter not supported model: ', config.model);
    return null;
  }
};
