FROM node:22

WORKDIR /app

COPY package*.json .
COPY dist ./dist

RUN npm i --omit=dev

ENV DEV=false
ENV BOT_TOKEN=

CMD [ "node", "." ]
