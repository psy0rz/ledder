
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

