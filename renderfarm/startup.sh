#!/usr/bin/env bash

cd /opt/biocad/renderfarm

su biocad -c "./chrome_headless.sh &"
su biocad -c "forever renderfarm.js"


