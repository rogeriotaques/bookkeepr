FROM node:22-alpine3.19

LABEL co.abtz.image.authors="Rogerio Taques <hello@abtz.co>"

ENV YARN_VERSION=4.0.2
RUN yarn policies set-version $YARN_VERSION
RUN npm install -g pm2

WORKDIR /bookkeepr
COPY ./frontend ./frontend
COPY ./backend/ ./backend
RUN mkdir -p /bookkeepr/data

WORKDIR /bookkeepr/frontend
RUN yarn install && yarn build

WORKDIR /bookkeepr/backend
RUN yarn install

VOLUME [ "/bookkeepr/data" ]

EXPOSE 8083

CMD ["pm2-runtime", "main.js"]
