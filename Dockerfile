
FROM node:10.15.0-alpine

RUN apk add git python make g++ yarn
RUN yarn global add forever webpack webpack-cli

RUN mkdir /opt/biocad
COPY . /opt/biocad/
RUN chown -R node:node /opt/biocad

USER node

RUN cd /opt/biocad && yarn install

RUN cd /opt/biocad && webpack --config webpack_nodejs_nologs.config.js && ls

WORKDIR /opt/biocad
CMD forever ./dist/bundle_cli.js server --port 8888


