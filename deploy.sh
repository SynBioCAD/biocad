#!/usr/bin/env bash

rm -rf deploy

git clone git@github.com:ngbiocad/biocad.git -b gh-pages deploy

node ./node_modules/webpack/bin/webpack.js --config webpack_browser.config.js

rm -rf deploy/*
echo "biocad.io" >> deploy/CNAME

cp -r dist/* deploy/

mkdir deploy/css
lessc less/biocad.less --include-path=node_modules/@biocad/jfw/less > ./deploy/css/biocad.css

cd deploy
git add .
git commit -a -u -m "deploy"
git push origin gh-pages



