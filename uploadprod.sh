#!/bin/bash

IP=$1

[ "$IP" ] || exit 1

npm run build
STUFF="src www"
#STUFF="src presets package.json yarn.lock node_modules"

#find $STUFF|entr -s "npm run build; rsync -avx $STUFF root@$IP:ledder && ssh root@$IP 'pkill node ;cd ledder && node js/server.js'"
#npm run build
rsync -avx $STUFF root@$IP:ledder ||exit 1
ssh root@$IP 'pkill node ;cd ledder && NODE_ENV=production node src/js/server.js'
