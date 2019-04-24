"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Layout_1 = require("biocad/cad/Layout");
const ImageRenderer_1 = require("biocad/cad/ImageRenderer");
const sbolgraph_1 = require("sbolgraph");
const geom_1 = require("jfw/geom");
const fs = require("fs");
const LayoutPOD_1 = require("biocad/cad/LayoutPOD");
const express = require("express");
const bodyParser = require("body-parser");
const yargs = require("yargs");
yargs
    .option('in', {
    alias: 'i',
    description: 'Input filename FASTA/GenBank/SBOL',
    demandOption: false
})
    .option('out', {
    alias: 'o',
    description: 'Output filename',
    demandOption: false
})
    .option('outfmt', {
    alias: 'f',
    description: 'Output format',
    demandOption: false,
    choices: ['svg', 'pdf', 'pptx'],
    default: 'svg'
})
    .command('testall', 'run all tests in testfiles', () => { }, testall)
    .command('render <file>', 'render one file', () => { }, render)
    .command('server <port>', 'run server', () => { }, server)
    .showHelpOnFail(true)
    .demandCommand()
    .help()
    .argv;
function testall(argv) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let file of fs.readdirSync('testfiles')) {
            if (!file.endsWith('.xml') || file.endsWith('_sbolx.xml'))
                continue;
            let path = 'testfiles/' + file;
            yield doFile(path, ImageRenderer_1.ImageFormat.SVG);
        }
    });
}
function server(argv) {
    return __awaiter(this, void 0, void 0, function* () {
        let server = express();
        server.use(bodyParser.text({
            type: '*/*',
            limit: '1mb'
        }));
        server.use((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            let graph = yield sbolgraph_1.SBOLXGraph.loadString(req.body, 'application/rdf+xml');
            let layout = new Layout_1.default(graph);
            layout.syncAllDepictions(5);
            layout.configurate([]);
            layout.size = layout.getBoundingSize().add(geom_1.Vec2.fromXY(1, 1));
            let renderer = new ImageRenderer_1.default(layout);
            let svg = yield renderer.render(ImageRenderer_1.ImageFormat.SVG);
            res.header('content-type', 'image/svg+xml');
            res.send(svg);
        }));
        server.listen(argv.port);
    });
}
function render(argv) {
    return __awaiter(this, void 0, void 0, function* () {
        let outfmt = ImageRenderer_1.ImageFormat.SVG;
        if (argv.outfmt === 'pdf') {
            outfmt = ImageRenderer_1.ImageFormat.PDF;
        }
        else if (argv.outfmt === 'pptx') {
            outfmt = ImageRenderer_1.ImageFormat.PPTX;
        }
        yield doFile(argv.file, outfmt);
    });
}
function doFile(path, outfmt) {
    return __awaiter(this, void 0, void 0, function* () {
        let graph = yield sbolgraph_1.SBOLXGraph.loadString(fs.readFileSync(path) + '', 'application/rdf+xml');
        //fs.writeFileSync('testfiles/' + file + '_sbolx.xml', graph.serializeXML())
        let layout = new Layout_1.default(graph);
        layout.syncAllDepictions(5);
        layout.configurate([]);
        layout.size = layout.getBoundingSize().add(geom_1.Vec2.fromXY(1, 1));
        let renderer = new ImageRenderer_1.default(layout);
        let svg = yield renderer.render(outfmt);
        fs.writeFileSync(path + '.svg', svg);
        fs.writeFileSync(path + '_layout.json', JSON.stringify(LayoutPOD_1.default.serialize(layout), null, 2));
    });
}
//# sourceMappingURL=main.js.map