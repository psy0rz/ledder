#!/bin/bash

#(maybe someday we will fix rpi-ws281x so that it does this detection at runtime instead of compile time)
if ! [ -e .rpicompiled ] && [ -e /proc/device-tree/model ]; then
  echo "Detected `cat /proc/device-tree/model`"
  echo "Compiling rpi-ws281x-smi for this device. This will take a few minutes.."
  npm install 'github:psy0rz/rpi-ws281x-smi#v0.1'
  touch .rpicompiled
  echo "Compile DONE!"
fi

exec node ledder/server/server.js
