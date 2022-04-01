#!/bin/bash

#dit gaat er vanuit dat de webinterface ergens anders draait en via websocket hem aanstuurt
#(of dat de production al deployed is in www op de server)

IP=$1

[ "$IP" ] || exit 1

STUFF="src"

#find $STUFF|entr -s "npm run build; rsync -avx $STUFF root@$IP:ledder && ssh root@$IP 'pkill node ;cd ledder && node js/server.js'"
#npm run build
find $STUFF| entr -r -s "rsync -avx $STUFF root@$IP:ledder && ssh root@$IP 'pkill node; cd ledder && NODE_ENV=production node src/js/server.js skip'"
