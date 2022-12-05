// Characteristics: http://auto.caitken.com/posts/2018/09/09/nodered-homekit-characteristics-reference
const MiHumidifierFactory = require('./devices/MiHumidifierFactory');

let Service, Characteristic;

module.exports = homebridge => {
    Service = homebridge.hap.Service
    Characteristic = homebridge.hap.Characteristic
    homebridge.registerAccessory('homebridge-zian-humidifer', 'ZianMiHumidifier', ZianMiHumidifier)
};

class ZianMiHumidifier {
    constructor(log, config, api) {
        if (!config.ip) throw new Error('Your must provide IP address of the Humidifier');
        if (!config.token) throw new Error('Your must provide token of the Humidifier');

        this.humidifier = MiHumidifierFactory.create(log, config, api);
        if (this.humidifier) {
            this.services = [this.humidifier.getInfoService(),
                this.humidifier.getHumidifierService()].concat(this.humidifier.getOptionalServices());
            this.humidifier.discover();
        }
    }

    // ignore unused
    getServices() {
        return this.services;
    }
}
