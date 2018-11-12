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
main();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let f = process.argv.slice(2).join(' ');
        if (f) {
            yield doFile(f);
        }
        else {
            for (let file of fs.readdirSync('testfiles')) {
                if (!file.endsWith('.xml') || file.endsWith('_sbolx.xml'))
                    continue;
                let path = 'testfiles/' + file;
                yield doFile(path);
            }
        }
        function doFile(path) {
            return __awaiter(this, void 0, void 0, function* () {
                let graph = yield sbolgraph_1.SBOLXGraph.loadString(fs.readFileSync(path) + '', 'application/rdf+xml');
                //fs.writeFileSync('testfiles/' + file + '_sbolx.xml', graph.serializeXML())
                let layout = new Layout_1.default(graph);
                layout.syncAllDepictions(5);
                layout.configurate([]);
                layout.size = layout.getBoundingSize().add(geom_1.Vec2.fromXY(1, 1));
                let renderer = new ImageRenderer_1.default(layout);
                let svg = renderer.renderToSVGString();
                fs.writeFileSync(path + '.svg', svg);
            });
        }
    });
}
//# sourceMappingURL=main.js.map