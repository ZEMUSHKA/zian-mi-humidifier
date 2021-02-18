const miio = require('miio');

module.exports = class {
  constructor(log, config, api) {
    this.log = log;
    this.config = config;
    this.api = api;

    let Service = this.api.hap.Service;
    let Characteristic = this.api.hap.Characteristic;

    // Properties
    this.ip = this.config.ip;
    this.token = this.config.token;

    this.device = null;

    // InfoService
    this.infoService = new Service.AccessoryInformation();
    this.infoService.setCharacteristic(Characteristic.Manufacturer, 'Xiaomi').
        setCharacteristic(Characteristic.Model, config.model).
        setCharacteristic(Characteristic.SerialNumber, config.ip);

    // HumidifierService
    this.humidifierService = new Service.HumidifierDehumidifier(config.name);
    this.humidifierService.getCharacteristic(
        Characteristic.TargetHumidifierDehumidifierState).
        setProps({validValues: [1]}).
        setValue(Characteristic.TargetHumidifierDehumidifierState.HUMIDIFIER);

    // OptionalServices
    this.optionalServices = [];

    // Cached values
    this.cache = {}
  }

  // private
  registerCharacteristic(cconfig) {
    const characteristic = cconfig.service.getCharacteristic(cconfig.type);
    if (cconfig.props) {
      characteristic.setProps(cconfig.props);
    }

    if ('get' in cconfig) {
      let cconfigget = cconfig.get;
      characteristic.on('get', async function(callback) {
        // this.log.info(`[${cconfig.id}]-[GET]`);
        if (!this.verifyDevice(callback)) {
          return;
        }

        // get value from cache
        let call_args = cconfigget.call_args(this)[0];
        let cached_value = this.cache[[call_args.siid, call_args.piid]];
        this.log.info(`[${cconfig.id}]-[GET] value`, cached_value);
        cconfigget.response_callback(this, [{value: cached_value}], callback);

      }.bind(this));
    }

    if ('set' in cconfig) {
      let cconfigset = cconfig.set;
      characteristic.on('set', async function(value, callback) {
        this.log.info(`[${cconfig.id}]-[SET]`, value);
        if (!this.verifyDevice(callback)) {
          return;
        }
        this.log.debug(
            `[${cconfig.id}]-[SET] Call device:`, cconfigset.call_name,
            cconfigset.call_args(this, value));
        this.device.call(cconfigset.call_name, cconfigset.call_args(this, value))
        .then(result => {
          this.log.debug(`[${cconfig.id}]-[SET] Response from device:`, result);
          
          // update cache right now
          let call_args = cconfigset.call_args(this, value)[0];
          this.cache[[call_args.siid, call_args.piid]] = call_args.value;
          
          cconfigset.response_callback(this, result, callback);
        })
        .catch(err => {
          this.log.warn(`[${cconfig.id}]-[SET] Error:`, err);
          callback(err);
        });
      }.bind(this));
    }
  }

  // public
  getInfoService() {
    return this.infoService;
  }

  // public
  getHumidifierService() {
    return this.humidifierService;
  }

  // public
  getOptionalServices() {
    return this.optionalServices;
  }

  // private
  verifyDevice(callback) {
    if (!this.device) {
      callback(new Error('No humidifier is discovered'));
      return false;
    }
    return true;
  }

  // public
  async discover() {
    try {
      this.device = await miio.device({address: this.ip, token: this.token});
      this.log.debug(`Discovered model: ${this.device.miioModel}`);
      // let info = await this.device.call("miIO.info", []);
      // console.log(info);
      this.log.debug(`Discovered id: ${this.device.id}`);
      // prohibit to go to idle
      this.infinitePolling();
    } catch (e) {
      this.log.warn('Fail to discover the device. Retry in 10 sec', e);
      setTimeout(() => { this.discover(); }, 10000);
    }
  }

  updateCache() {
    // ca4
    this.device.call('get_properties', [
      { did: this.device.id, siid: 3, piid: 9, value: null },
      { did: this.device.id, siid: 2, piid: 1, value: null },
      { did: this.device.id, siid: 6, piid: 1, value: null },
      { did: this.device.id, siid: 2, piid: 8, value: null },
      { did: this.device.id, siid: 2, piid: 7, value: null },
      { did: this.device.id, siid: 2, piid: 6, value: null },
      { did: this.device.id, siid: 2, piid: 5, value: null },
      { did: this.device.id, siid: 5, piid: 2, value: null },
      { did: this.device.id, siid: 3, piid: 7, value: null },
      { did: this.device.id, siid: 4, piid: 1, value: null },
    ])
    .then(result => {
      result.forEach(item => this.cache[[item.siid, item.piid]] = item.value);
      this.log.debug(`cache updated`);
    })
    .catch(err => { this.log.warn(`cache update failed`); });
  }

  async infinitePolling() {
    // cache is constantly updated
    this.updateCache();
    setTimeout(() => { this.infinitePolling(); }, 30000);
  }

  sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

};
