# DO NOT USE THIS PLUGIN

### Example config

```json
{
  "bridge": {
    "name": "Homebridge",
    "username": "CC:22:3D:E4:CE:30",
    "port": 51826,
    "pin": "031-45-154"
  },
  "platforms": [],
  "accessories": [
    {
      "accessory": "ZianMiHumidifier",
      "name": "Bedroom Humidifier",
      "ip": "192.168.x.x",
      "token": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "model": "v1",
      "nameTemperature": "Bedroom Temperature 1",
      "showHumidity": false
    }
  ]
}
```

### Humidifier configuration

- `ip` – device IP address;
- `token` – device token (32 hex chars);
- `model` (optional) – the model of a humidifier (`v1` for Smartmi Humidifier, `ca1` or `cb1` for Smartmi Evaporative Humidifier). Default is 'v1';
- `name` (optional) – device name. Default is 'Humidifier';
- `showMuteSwitch` (optional) – if `true`, the mute humidifier buzzer switch will be added. Default is `false`;
- `nameMuteSwitch` (optional) – mute humidifier buzzer switch name. Default is 'Mute humidifier';
- `showTemperature` (optional) – if `true`, the temperature sensor will be added. Default is `false`;
- `nameTemperature` (optional) – temperature sensor name. Default is 'Temperature';
- `showHumidity` (optional) – if `true`, the humidity sensor will be added. Default is `false`;
- `nameHumidity` (optional) – humidity sensor name. Default is 'Humidity'.
