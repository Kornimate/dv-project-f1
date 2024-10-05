FROM node:18 as build

WORKDIR /app

ENV API_URL=/api

COPY public/* /app/public/

COPY src/* /app/src/

COPY package.json /app

COPY package-lock.json /app

RUN npm install

FROM nginx:alpine

COPY ./build /usr/share/nginx/html

COPY default.conf /etc/nginx/conf.d

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

