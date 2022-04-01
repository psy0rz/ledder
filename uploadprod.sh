#!/bin/bash

IP=$1

[ "$IP" ] || exit 1

npm run build
STUFF="src www"
#STUFF="src"

rsync -avx $STUFF root@$IP:ledder ||exit 1
ssh root@$IP 'pkill node ;cd ledder && NODE_ENV=production node src/js/server.js skip'
