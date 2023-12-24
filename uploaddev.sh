#!/bin/bash

#dit gaat er vanuit dat de webinterface ergens anders draait en via websocket hem aanstuurt
#(of dat de production al deployed is in www op de server)

IP=$1

[ "$IP" ] || exit 1

STUFF="src www presets fonts ledder package.json displayconf.js"

#find $STUFF|entr -s "npm run build; rsync -avx $STUFF root@$IP:ledder && ssh root@$IP 'pkill node ;cd ledder && node js/server.js'"
#npm run build
#find $STUFF| entr -r -s "rsync -avx . root@$IP:ledder && ssh root@$IP 'pkill node; tmux new -d \"cd /root/ledder; node src/js/server/server.js\" '"
find $STUFF| entr -r -s "rsync -avx $STUFF root@$IP:ledder && ssh root@$IP 'pkill loop;pkill node; cd /root/ledder; NODE_ENV=production node ledder/server/server.js'"
