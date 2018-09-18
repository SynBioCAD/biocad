#!/usr/bin/env bash

rm -rf chrome_tmp
mkdir chrome_tmp
chromium-browser --headless --disable-gpu --window-size=1440,900 --remote-debugging-port=9222 --disable-web-security --user-data-dir=./chrome_tmp --enable-logging --v=1

