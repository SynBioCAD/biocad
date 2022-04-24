SynBioCAD is an open-source, Web-based computer aided design (CAD) tool for [synthetic biology](http://www.synbioproject.org/topics/synbio101/definition/) built on the [SBOL standard](http://sbolstandard.org/).

Things you can do so far:

* Visualization of SBOL3 designs
* Drag and drop modification of designs
* Sequence editing

Many more features are planned.  Watch this space!

# Usage

SynBioCAD can run in several different configurations.

## Local interactive

    yarn install
    node build_browser.js

This will generate a file called `bundle_browser.js` which contains the biocad webapp and all of its dependencies. Open `index.html` in a Web browser to use it.

## Local non-interactive

    yarn install
    node build_cli.js
    
Then run `node bundle_cli.js testall` to test all examples in testfiles

## Web service

As a Web service, SynBioCAD accepts POSTed SBOL/GenBank files and returns SVG.

    yarn install
    node build_cli.js
    node bundle_cli.js server 8080

Or use the provided Dockerfile.

