
# Ledder

![ledder](./doc/2022-12-30_23-25.png)

Make cool animated pixel animations, and stream it to a led matrix display.

Control in realtime via a webgui.

LIVE DEMO: https://ledder.datux.nl

## Overview picture

Ledder can control leds in multiple ways:

<img width="974" alt="image" src="https://github.com/user-attachments/assets/9ee2360f-804b-4347-aad5-07fc43c55c9b" />

Look at the [Wiki](https://github.com/psy0rz/ledder/wiki) for more info



## Quick start, without docker


First time:
```
npm install
npm run build
```

Installing/building takes long, but after that starting will be fast:

```
npm start
```

Go to http://localhost:3000

![ledder](./doc/2022-12-30_23-25_1.png)

## Quicker start, with docker 

Just use
```
docker-compose up
```
Takes a while, since it also has to render the previews the first time.

Go to <http://localhost:3000> when its done.

## Control via MQTT

You can control ledder via mqtt, by starting the MQTT animation. In the controls of that animation you can specify mqtt host and topic.

The default will connect to our hackerspace mqtt, you can use it to test. (if it works :)

### Starting an animation

Use this topic: `ledder/select`:

Example:

```console
mosquitto_pub -h mqtt.hackerspace-drenthe.nl -t 'ledder/select' -m 'Text/Marquee/default'
```

### Getting controls for selected animation

Use this topic: `ledder/get`

Example:
```console
mosquitto_pub -h mqtt.hackerspace-drenthe.nl -t 'ledder/get' -m ''
```

MQTT output:
```
ledder/get (null)
ledder/state/Font {"selected":"C64"}
ledder/state/Font height {"value":0}
ledder/state/Font width {"value":0}
ledder/state/Text {"text":"Marquee  "}
ledder/state/Text color {"r":33,"g":255,"b":0,"a":1}
ledder/state/Stars/Enabled {"enabled":false}
ledder/state/Star field/Enabled {"enabled":false}
ledder/state/The Matrix/Enabled {"enabled":false}
ledder/state/Scrolling/Enabled {"enabled":true}
ledder/state/Scrolling/FPS {"value":60}
ledder/state/Scrolling/Rotate interval {"value":2}
ledder/state/Scrolling/Rotate interval randomizer {"value":0}
ledder/state/Scrolling/Rotate X step {"value":-1}
ledder/state/Font {"selected":"C64"}
ledder/state/Scrolling/Rotate Y step {"value":0}
ledder/state/Font height {"value":0}
ledder/state/Scrolling/Circular {"enabled":false}
...
```

### Setting a control

For example to change the text of the marquee animation:
```
mosquitto_pub -h mqtt.hackerspace-drenthe.nl -t 'ledder/set/Text' -m '{"text":"hello"}'
```


