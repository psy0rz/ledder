# syntax=docker/dockerfile:1

#NOTE: when using alpine it seems building on arm via github actions hangs forever

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

CMD [ "node","ledder/server/server.js" ]


### final stage armv7 (for raspberry)
FROM --platform=linux/arm/v7 node:22 AS ledder-armv7
ENV NODE_ENV=production

WORKDIR /app
COPY --from=builder /app /app

#rebuilds stuff for arm if needed
RUN npm rebuild --verbose

RUN npm install github:psy0rz/rpi-ws281x-smi

CMD [ "node","ledder/server/server.js" ]


