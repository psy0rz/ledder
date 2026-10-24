#!/bin/bash
npm run buildweb
rsync --exclude settings.json --exclude node_modules --exclude .cache -avx . $1:ledder/
ssh $1 "cd ledder; docker compose restart"
