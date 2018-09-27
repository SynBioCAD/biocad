#!/usr/bin/env bash

rm -rf deploy

git clone git@github.com:ngbiocad/biocad.git -b gh-pages deploy

webpack

cp -r dist/* deploy/

mkdir deploy/css
lessc less/biocad.less --include-path=node_modules/jfw/less > ./deploy/css/biocad.css



