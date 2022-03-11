#!/bin/bash

IP=$1

[ "$IP" ] || exit 1

#STUFF="js index.html dist presets"
STUFF="js index.html dist"

find $STUFF|entr -r -s "npm run build; rsync -avx $STUFF root@$IP:ledder && ssh root@$IP 'pkill node ;cd ledder && node js/server.js'"

