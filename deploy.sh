#!/usr/bin/env bash

rm -rf deploy

git clone git@github.com:ngbiocad/biocad.git -b gh-pages deploy

node ./node_modules/webpack/bin/webpack.js 

cp -r dist/* deploy/

mkdir deploy/css
lessc less/biocad.less --include-path=node_modules/jfw/less > ./deploy/css/biocad.css

cd deploy
git commit -a -m "deploy"
git push origin gh-pages



