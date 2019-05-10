ngBioCAD is an open-source, Web-based computer aided design (CAD) tool for [synthetic biology](http://www.synbioproject.org/topics/synbio101/definition/) built on the [SBOL standard](http://sbolstandard.org/).

Things you can do so far:

* Visualization of SBOL2 designs inc. ModuleDefinitions and interactions
* Drag and drop modification of designs
* Sequence editing

Many more features are planned.  Watch this space!

# Usage

ngBioCAD can run in several different configurations.

## Local webapp

    yarn
    node dev-server.js ./webpack_browser.config.js

Then load `http://localhost:9999/index.html` in a Web browser

## Local offline

    yarn install
    node dev-server.js ./webpack_nodejs.config.js
    
Then run `node bundle_cli.js testall` to test all examples in testfiles

## Web service

As a Web service, ngBioCAD accepts POSTed SBOL/GenBank files and returns SVG.

First follow the local offline instructions, then run:

    node bundle_cli.js server --port 8080

Or use the provided Dockerfile.

