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


### final stage multiarch 
FROM --platform=linux/arm64 node:22 AS ledder
ENV NODE_ENV=production

RUN apt update && apt install -y build-essential cmake
COPY entrypoint.sh /

WORKDIR /app
COPY --from=builder /app /app

#rebuilds stuff for specific arch if needed
RUN npm rebuild --verbose

STOPSIGNAL SIGKILL

ENTRYPOINT [ "/entrypoint.sh" ]

