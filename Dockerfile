FROM node:22-alpine3.19

LABEL co.abtz.image.authors="Rogerio Taques <hello@abtz.co>"

WORKDIR /bookkeepr
COPY ./api/ ./api
COPY ./app ./app

WORKDIR /bookkeepr/app
RUN yarn install && yarn build

WORKDIR /bookkeepr/api
RUN yarn install
RUN yarn global add pm2

VOLUME [ "/bookkeepr/api/data" ]

EXPOSE 8083

CMD ["pm2-runtime", "main.js"]
