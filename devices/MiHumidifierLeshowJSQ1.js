// MiHumidifierLeshowJSQ1
const MiHumidifierAdapter = require('./MiHumidifierAdapter');

module.exports = class extends MiHumidifierAdapter {

  // https://miot-spec.org/miot-spec-v2/instance?type=urn:miot-spec-v2:device:humidifier:0000A00E:leshow-jsq1:2
  constructor (log, options, api) {
    super(log, options, api, [
      {siid: 3, piid: 1},
      {siid: 2, piid: 1},
      {siid: 2, piid: 7},
      {siid: 2, piid: 6},
      {siid: 2, piid: 3},
      {siid: 10, piid: 2},
      {siid: 5, piid: 1},
    ]);

    let Service = this.api.hap.Service;
    let Characteristic = this.api.hap.Characteristic;

    let characteristicsConfigs = [
      {
        id     : 'CurrentRelativeHumidity',
        service: this.humidifierService,
        type   : Characteristic.CurrentRelativeHumidity,
        props  : null,
        get    : {
          call_name        : 'get_properties',
          call_args        : function (_this) {
            return [{ did: _this.device.id, siid: 3, piid: 1, value: null }]
          },
          response_callback: function (_this, result, callback) {
            callback(null, result[0].value)
            // callback(null, 0)
          },
        },
      },
      {
        id     : 'CurrentHumidifierDehumidifierState',
        service: this.humidifierService,
        type   : Characteristic.CurrentHumidifierDehumidifierState,
        props  : { validValues: [0, 2] },
        get    : {
          call_name        : 'get_properties',
          call_args        : function (_this) {
            return [{ did: _this.device.id, siid: 2, piid: 1, value: null }]
          },
          response_callback: function (_this, result, callback) {
            callback(null, result[0].value
              ? Characteristic.CurrentHumidifierDehumidifierState.HUMIDIFYING
              : Characteristic.CurrentHumidifierDehumidifierState.INACTIVE)
          },
        },
      },
      {
        id     : 'Active',
        service: this.humidifierService,
        type   : Characteristic.Active,
        props  : null,
        get    : {
          call_name        : 'get_properties',
          call_args        : function (_this) {
            return [{ did: _this.device.id, siid: 2, piid: 1, value: null }]
          },
          response_callback: function (_this, result, callback) {
            callback(null, result[0].value
              ? Characteristic.Active.ACTIVE
              : Characteristic.Active.INACTIVE)
          },
        },
        set    : {
          call_name        : 'set_properties',
          call_args        : function (_this, value) {
            return [{ did  : _this.device.id, siid : 2, piid : 1,
              value: Characteristic.Active.ACTIVE === value }]
          },
          response_callback: function (_this, result, callback) {
            if (result[0].code === 0) {
              callback(null)
            } else {
              callback(new Error(result[0]))
            }
          },
        },
      },
      {
        id     : 'WaterLevel',
        service: this.humidifierService,
        type   : Characteristic.WaterLevel,
        props  : null,
        get    : {
          call_name        : 'get_properties',
          call_args        : function (_this) {
            return [{ did: _this.device.id, siid: 2, piid: 7, value: null }]
          },
          response_callback: function (_this, result, callback) {
            callback(null, result[0].value)
          },
        },
      },
      {
        id     : 'RelativeHumidityHumidifierThreshold',
        service: this.humidifierService,
        type   : Characteristic.RelativeHumidityHumidifierThreshold,
        props  : {
          minValue: 0,
          maxValue: 100,
          minStep : 1,
        },
        get    : {
          call_name        : 'get_properties',
          call_args        : function (_this) {
            return [{ did: _this.device.id, siid: 2, piid: 6, value: null }]
          },
          response_callback: function (_this, result, callback) {
            callback(null, result[0].value)
          },
        },
        set    : {
          call_name        : 'set_properties',
          call_args        : function (_this, value) {
            value = Math.max(value, 40)
            value = Math.min(value, 70)
            return [{ did: _this.device.id, siid: 2, piid: 6, value: value }]
          },
          response_callback: function (_this, result, callback) {
            if (result[0].code === 0) {
              callback(null)
            } else {
              callback(new Error(result[0]))
            }
          },
        },
      },
      {
        id     : 'RotationSpeed',
        service: this.humidifierService,
        type   : Characteristic.RotationSpeed,
        props  : {
          minValue: 0,
          maxValue: 3,
          minStep : 1,
        },
        get    : {
          call_name        : 'get_properties',
          call_args        : function (_this) {
            return [{ did: _this.device.id, siid: 2, piid: 3, value: null }]
          },
          response_callback: function (_this, result, callback) {
            callback(null, 3 - result[0].value)
          },
        },
        set    : {
          call_name        : 'set_properties',
          call_args        : function (_this, value) {
            if (value === 0) {
              // workaround, fake set
              return [{ did: _this.device.id, siid: 100, piid: 100, value: 0 }]
            } else {
              return [{ did: _this.device.id, siid: 2, piid: 3, value: 3 - value}]
            }
          },
          response_callback: function (_this, result, callback) {
            if (result[0].code === 0) {
              callback(null)
            } else {
              if (result[0].siid === 100) {
                // ignore error on fake set
                callback(null)
              } else {
                callback(new Error(result[0]))
              }
            }
          },
        },
      },
    ];

    // DisplayService
    this.displayService = new Service.Switch(options.nameMuteSwitch + 'Screen', 'screen');
    this.optionalServices.push(this.displayService);
    characteristicsConfigs = characteristicsConfigs.concat([
      {
        id     : 'DS.Brightness',
        service: this.displayService,
        type   : Characteristic.On,
        props  : null,
        get    : {
          call_name        : 'get_properties',
          call_args        : function (_this) {
            return [{ did: _this.device.id, siid: 10, piid: 2, value: null }]
          },
          response_callback: function (_this, result, callback) {
            callback(null, result[0].value === 100)
          },
        },
        set    : {
          call_name        : 'set_properties',
          call_args        : function (_this, value) {
            return [{ did: _this.device.id, siid: 10, piid: 2, value: value ? 100 : 50 }]
          },
          response_callback: function (_this, result, callback) {
            if (result[0].code === 0) {
              callback(null)
            } else {
              callback(new Error(result[0]))
            }
          },
        },
      },
    ]);

    // HumiditySensorService
    if (options.showHumidity) {
      this.humiditySensorService = new Service.HumiditySensor(
        options.nameHumidity);
      this.optionalServices.push(this.humiditySensorService);
      characteristicsConfigs = characteristicsConfigs.concat([
        {
          id     : 'HSS.CurrentRelativeHumidity',
          service: this.humiditySensorService,
          type   : Characteristic.CurrentRelativeHumidity,
          props  : null,
          get    : {
            call_name        : 'get_properties',
            call_args        : function (_this) {
              return [{ did: _this.device.id, siid: 3, piid: 1, value: null }]
            },
            response_callback: function (_this, result, callback) {
              callback(null, result[0].value)
            },
          },
        },
      ])
    }

    // TemperatureSensorService
    // no temp on this model

    // SpeakerService
    if (options.showMuteSwitch) {
      this.speakerService = new Service.Switch(options.nameMuteSwitch + 'Speaker', 'speaker');
      this.optionalServices.push(this.speakerService);
      characteristicsConfigs = characteristicsConfigs.concat([
        {
          id     : 'SS.On',
          service: this.speakerService,
          type   : Characteristic.On,
          props  : null,
          get    : {
            call_name        : 'get_properties',
            call_args        : function (_this) {
              return [{ did: _this.device.id, siid: 5, piid: 1, value: null }]
            },
            response_callback: function (_this, result, callback) {
              callback(null, result[0].value)
            },
          },
          set    : {
            call_name        : 'set_properties',
            call_args        : function (_this, value) {
              return [{ did  : _this.device.id, siid : 5, piid : 1, value: value }]
            },
            response_callback: function (_this, result, callback) {
              if (result[0].code === 0) {
                callback(null)
              } else {
                callback(new Error(result[0]))
              }
            },
          },
        },
      ])
    }

    for (let cconfig in characteristicsConfigs) {
      this.registerCharacteristic(characteristicsConfigs[cconfig]);
    }

  }

};
