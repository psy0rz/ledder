#!/bin/bash

IP=$1

[ "$IP" ] || exit 1

npm run build
STUFF="src www presets fonts ledder package.json"
#STUFF="src"

#rsync -avx $STUFF root@$IP:ledder ||exit 1
#ssh root@$IP 'pkill node ;cd ledder && npm run production'
find $STUFF| entr -r -s "rsync -avx $STUFF root@$IP:ledder && ssh root@$IP 'pkill node; cd /root/ledder; NODE_ENV=production node ledder/server/server.js'"
