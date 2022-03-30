#!/bin/bash

IP=$1

[ "$IP" ] || exit 1

STUFF="js index.html dist"
STUFF="js index.html dist presets"

#find $STUFF|entr -s "npm run build; rsync -avx $STUFF root@$IP:ledder && ssh root@$IP 'pkill node ;cd ledder && node js/server.js'"
npm run build
rsync -avx . root@$IP:ledder ||exit 1
ssh root@$IP 'pkill node ;cd ledder && NODE_ENV=production node src/js/server.js'
