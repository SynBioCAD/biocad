#!/usr/bin/env bash

rm -rf biocad

mkdir biocad
mkdir biocad/renderfarm

cp -r * biocad/renderfarm
rm -rf biocad/renderfarm/node_modules

cp -r ../dist biocad
cp ../configs/headless.json ./biocad/dist/config

docker stop renderfarm
docker rm renderfarm
docker rmi localhost:5000/renderfarm
docker rmi renderfarm/renderfarm:v1.0.0

docker build . -t renderfarm/renderfarm:v1.0.0

docker tag renderfarm/renderfarm:v1.0.0 localhost:5000/renderfarm




