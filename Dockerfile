
FROM node:16-alpine3.14

RUN apk add git python make g++ yarn
RUN yarn global add forever webpack webpack-cli

RUN mkdir /opt/biocad
COPY . /opt/biocad/
RUN chown -R node:node /opt/biocad

USER node

RUN cd /opt/biocad && yarn install
RUN cd /opt/biocad && node build_cli.js && ls

WORKDIR /opt/biocad
CMD forever bundle_cli.js server 8888


