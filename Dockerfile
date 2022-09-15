# syntax=docker/dockerfile:1

FROM node:latest

ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]


RUN NODE_ENV=development npm install 

COPY . .

RUN npm run build
RUN npm run buildpreviews

CMD [ "npm", "run", "production" ]



