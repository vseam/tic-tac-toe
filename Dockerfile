FROM node:alpine

WORKDIR /src
COPY . /src

RUN npm install

COMMAND npm start
EXPOSE 3000
