#!/usr/bin/env bash

docker stop renderfarm
docker rm renderfarm
docker run -p 9991:9991 --name renderfarm --security-opt seccomp=chrome.json renderfarm/renderfarm:v1.0.0


