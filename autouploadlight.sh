#!/bin/bash

IP=$1

[ "$IP" ] || exit 1

STUFF="src"

#find $STUFF|entr -s "npm run build; rsync -avx $STUFF root@$IP:ledder && ssh root@$IP 'pkill node ;cd ledder && node js/server.js'"
#npm run build
find $STUFF| entr -r -s "rsync -avx $STUFF root@$IP:ledder && ssh root@$IP 'pkill node; cd ledder && node src/js/server.js'"
