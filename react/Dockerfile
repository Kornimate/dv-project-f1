FROM node:18 as build

WORKDIR /app

ENV REACT_APP_API_URL=/api

ENV NODE_OPTIONS=--openssl-legacy-provider

COPY . .

RUN npm install

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

COPY default.conf /etc/nginx/conf.d

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

