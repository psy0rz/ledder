# syntax=docker/dockerfile:1

# cacheble npm install stage that only reruns if package.json actually changes.
FROM node:22 AS builder

ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]


RUN NODE_ENV=production npm install

COPY . .

RUN npm run build

RUN npm prune --production

# final stage
FROM node:22 AS final
ENV NODE_ENV=production

WORKDIR /app
COPY --from=builder /app /app



CMD [ "npm", "run", "docker" ]
