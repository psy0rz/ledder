# Overal structure:

## current directory

Core ledder animation framework. Has minimal external dependencies. Everything else is direved from this. 

## ./animations

The actual interesting stuff you're probably looking for :)

## ./draw

Classes to draw stuff. (if you dont want pixel-bang)

These are a pixel container, that fill themself with pixels.

## ./fx 

Effects that can be applied to existing pixelcontainers or color-objects.

## ./drivers

LED drivers to control hardware

## ./server

The RPC server that runs the actual animations and handles everything else.

*note that the webinterface is written in Framwork7/svelte in ../src*


