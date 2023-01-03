FROM node:alpine

RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot

COPY bot/package.json .
COPY bot/package-lock.json .

RUN npm install

COPY bot .

CMD node index.js
