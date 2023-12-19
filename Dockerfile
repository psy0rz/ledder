# syntax=docker/dockerfile:1

#FROM node:latest
FROM node:21 AS builder

#build tools for alpine
# RUN apk --no-cache add python3
# RUN apk --no-cache add make
# RUN apk --no-cache add gcc
# RUN apk --no-cache add musl-dev
# RUN apk --no-cache add g++

ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]


RUN NODE_ENV=development npm install

COPY . .

RUN npm run buildweb

RUN npm prune --production

# final stage
FROM node:21 AS final
ENV NODE_ENV=production

WORKDIR /app
COPY --from=builder /app /app



CMD [ "npm", "run", "docker" ]
