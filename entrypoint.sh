#!/bin/bash

#(maybe someday we will fix rpi-ws281x so that it does this detection at runtime instead of compile time)
if ! [ -e .recompiled ] && [ -e /proc/device-tree/model ]; then
  echo "Detected `cat /proc/device-tree/model`"
  echo "Recompiling rpi-ws281x-smi for this device. This will take 30s.."
  npm rebuild rpi-ws281x-smi
  touch .recompiled
  echo "Compile DONE!"
fi

exec node ledder/server/server.js
