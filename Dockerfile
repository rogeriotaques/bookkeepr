FROM node:22-alpine3.19

LABEL co.abtz.image.authors="Rogerio Taques <hello@abtz.co>"

ARG VITE_SERVER_PORT=3000
ENV VITE_SERVER_PORT=$VITE_SERVER_PORT

ENV YARN_VERSION=4.0.2
RUN yarn policies set-version $YARN_VERSION
RUN npm install -g pm2

USER node

WORKDIR /bookkeepr
COPY --chown=node:node ./app ./app
COPY --chown=node:node ./api/ ./api
RUN mkdir -p /bookkeepr/api/data

WORKDIR /bookkeepr/app
RUN yarn install && yarn build

WORKDIR /bookkeepr/api
RUN yarn install

VOLUME [ "/bookkeepr/api/data" ]

EXPOSE 3000

CMD ["pm2-runtime", "main.js"]
