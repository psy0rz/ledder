# syntax=docker/dockerfile:1

#NOTE: when using alpine it seems building on arm via github actions hangs forever

# cacheble npm install stage that only reruns if package.json actually changes.
FROM node:22 AS builder

ENV NODE_ENV=production

WORKDIR /app


COPY ["package.json", "package-lock.json*", "./"]

#will later be pruned
RUN NODE_ENV=development npm install

COPY . .

RUN npm run buildweb

RUN npm prune --production

# final stage
FROM node:22 AS final
ENV NODE_ENV=production

WORKDIR /app
COPY --from=builder /app /app

RUN npm run buildpreviews

CMD [ "node" , "ledder/server/server.js" ]
