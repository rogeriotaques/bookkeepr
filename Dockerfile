FROM node:22-alpine3.19

LABEL co.abtz.image.authors="Rogerio Taques <hello@abtz.co>"

# Lockfiles are generated with npm 11; the base image ships npm 10.
RUN npm install -g npm@11.17.0
RUN npm install -g pm2

WORKDIR /bookkeepr
COPY ./frontend ./frontend
COPY ./backend/ ./backend
RUN mkdir -p /bookkeepr/data

WORKDIR /bookkeepr/frontend
RUN npm ci && npm run build

WORKDIR /bookkeepr/backend
RUN npm ci --omit=dev

VOLUME [ "/bookkeepr/data" ]

EXPOSE 8083

CMD ["pm2-runtime", "main.js"]
