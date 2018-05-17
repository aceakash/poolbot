FROM node:9.11-alpine

WORKDIR /app

ADD package.json package-lock.json ./
RUN npm install


ADD . .
CMD npm start

