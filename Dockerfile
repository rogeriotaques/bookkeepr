FROM --platform=linux/amd64 node:22-alpine3.19

LABEL co.abtz.image.authors="Rogerio Taques <hello@abtz.co>"

ENV YARN_VERSION=4.0.2
RUN yarn policies set-version $YARN_VERSION
RUN npm install -g pm2

USER node

WORKDIR /bookkeepr
COPY --chown=node:node ./frontend ./frontend
COPY --chown=node:node ./backend/ ./backend
RUN mkdir -p /bookkeepr/data

WORKDIR /bookkeepr/frontend
RUN yarn install && yarn build

WORKDIR /bookkeepr/backend
RUN yarn install

VOLUME [ "/bookkeepr/data" ]

EXPOSE 8083

CMD ["pm2-runtime", "main.js"]
