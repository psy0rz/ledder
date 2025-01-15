# syntax=docker/dockerfile:1

#NOTE: when using alpine it seems building on arm via github actions hangs forever
# and we need node-gyp and other stuff. so the slim also doesnt work.


#### builder
FROM --platform=linux/amd64 node:22 AS builder

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]


#will later be pruned
RUN npm install

COPY . .

RUN npm run build
RUN npm prune --production


### final stage amd64
FROM --platform=linux/amd64 node:22 AS ledder-amd64
ENV NODE_ENV=production

WORKDIR /app
COPY --from=builder /app /app

ENTRYPOINT [ "node","ledder/server/server.js" ]


### builder forarmv7 (for raspberry). resuses most of amd64 builder for performance (qemu issues)
FROM --platform=linux/arm/v7 node:22 AS ledder-armv7-builder
ENV NODE_ENV=production

RUN apt update && apt install -y build-essential cmake
COPY entrypoint.sh /

WORKDIR /app
COPY --from=builder /app /app

#rebuilds stuff for arm if needed
RUN npm rebuild --verbose


ENTRYPOINT [ "/entrypoint.sh" ]


