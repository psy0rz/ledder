
# Ledder

![ledder](./doc/2022-12-30_23-25.png)

Make cool animated pixel animations, and stream it to a led matrix display.

Control in realtime via a webgui.

**Documentation and code are still work in progress, come back later if you're not that adventurous. :)**

LIVE DEMO: https://ledder.datux.nl

## Hardware

To control actual hardware use this in combination with DisplayQIOSUdp: https://github.com/psy0rz/ledstream

The displayconf-example.js has examples on how to configure it.

(We had raspberry, pixelflut and WLED drivers as well, but they are currenly broken)

## Quick start

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

## Docker 

Just use
```
docker-compose up
```
Takes a while, since it also has to render the previews the first time.

# Development

* Cool ledder stuff is under ledder/

* Webinterface stuff is under src/ Ignore it if you jusst want to play with leds and animations :)

Its much easier if you have a good editor that does good autocompletion. (Its the main reason i'm using Webstorm)

# Using ledder to create animations

## Pixels and colors

The most basic datastructures in ledder are Pixel() and Color() objects.

A Color() is what you expect and represents a color.

A Pixel() needs a color object and has an x and y coordinate.

```typescript
const color=new Color(255,0,0)
const pixel=new Pixel(3,3, color)
```

## Pixels lists

Just a list of pixels. Its actually just a Set() with extras.

They are very important and used for all kinds of things:

```typescript
const pixels=new PixelList()
pixels.add(pixel)
```

A pixel list can even contain other pixel lists, so it becomes a pixel tree:
````typescript
const otherList=new PixelList()
otherList.add(new Pixel(1,1, color))
otherList.add(pixels)
otherList.print()
````

Use the print() function to see whats going on:
```
pixeltree:
 (1, 1) (r255, g0, b0, a1)
 pixeltree:
  (3, 3) (r255, g0, b0, a1)
```

Its setup this way so that we can add/remove sets of huge pixelLists and still have high performance. (Since you're only adding/removing references.)

## Animators

(Note: Before you start its usefull to have a good editor. I prefer Webstorm, but vscode works as well.) 

To actually do stuff you need to create an Animator class.

Use Template.ts as an example to start with.

The run() function of the animator is where it all happens:
```typescript
export default class Test extends Animator {

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const color = new Color(255, 0, 0)
        const pixel = new Pixel(3, 3, color)
        box.add(pixel)

    }

}
```

It has THE 3 main parameters you will be working with:
* The box
* The scheduler
* The controls

### The box

A PixelBox is just a PixelList with extras: 

It has has minimum and maximum x and y coordinates, which you should stay within:
```typescript
console.log(box.xMin, box.xMax, box.yMin, box.yMax)
```

The main box is usually the one that is rendered to your Display and has the size of the display.

The size of the box is not enforced in any way, for performance and other reasons. 
So you still can add Pixels that are outside of it.

### The scheduler

The scheduler acts almost like setInterval and setTimeout. 
But its frame-based instead of time based. 

Use it to actually animate stuff.

An example of a moving pixel:

```typescript
export default class Test extends Animator {

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const color=new Color(255,0,0)
        const pixel=new Pixel(3,3, color)
        box.add(pixel)

        scheduler.interval(1, ()=>
        {
            pixel.move(1,0)
            pixel.wrap(box)

        })

    }
}
```

Note that you can also call move() and wrap() on the box to move all the pixels that added to the box.

### The controls

One awesome feature of ledder is that you can easily make stuff controllable by the user.

To make the example above fully controllable do something like this:

````typescript
export default class Test extends Animator {

    async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup) {

        const colorControl=controls.color('Main color')
        const controlY=controls.value('Y coordinate', 3, box.yMin, box.yMax , 1, true)
        const controlInterval=controls.value('Move interval', 1, 1,60)

        const pixel=new Pixel(0,controlY.value, colorControl)
        box.add(pixel)

        scheduler.intervalControlled(controlInterval, ()=>
        {
            box.move(1,0)
            box.wrap(box)

        })

    }
}

````

The use can now control your animation and even make presets! 
Some controls are realtime, while others will restart the animation if you change them. (by specifying true at the end)

#### Control types

Controls are very powerfull and are recursive as well. 
Look at the other animations how to use them optimally.

* control.value(): Just a number, with a minimum, maximum and step size.
* control.range(): A range between 2 numbers. 
* control.color(): Color selector
* control.switch(): On/off switch
* control.select(): Select box
* control.group(): Sub ControlGroup (recursively)
* control.input(): Text input

## Other stuff

You now know the core functions of ledder.

However, another goal of ledder is to make reusable components: Classes to draw boxes or create certain effects.


### Draw classes

In the draw-folder you'll find classes to "draw".

These are just PixelLists that fill themselfs with pixels.

E.g. to draw a rectangle:

```typescript
const rect = new DrawRectangle(0,0,3,3, color)
box.add(rect)

```

There are a bunch of really cool ones like DrawAsciiArt and DrawText. Look at other Animators how to use them. (The Logos for example)

Its also very easy to create new Draw-classes.

### FX classes

FX classes operate on existing PixelList() and Color() objects.

They can do some really awesome stuff, look at what the Marquee Animator can do for example.

The ledder-logo you see above is just a DrawText() combined with FxColorPattern(). 
I've just clicked around in the controls of the Marquee animator and took a screenshot. :)
