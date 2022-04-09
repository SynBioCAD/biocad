
import { View } from "@biocad/jfw/ui";
import { VNode, h, create, svg } from "@biocad/jfw/vdom";
import BiocadApp from "biocad/BiocadApp";

import { search, SearchResult } from 'sbh-proxy-client'

import SVGScrollerWidget from './SVGScrollerWidget'
import LibraryViewPartScroller from "biocad/mode/library/LibraryViewPartScroller";
import PartSummaryView from "biocad/mode/library/PartSummaryView";

export default class LibraryView extends View {

    partScroller:LibraryViewPartScroller

    constructor(app:BiocadApp) {

        super(app)

        this.partScroller = new LibraryViewPartScroller(app, this)

        this.partScroller.onClickPart.listen((uri:string) => {

            this.onClickPart(uri)

        })


    }

    activate() {

        this.partScroller.activate()


    }

    render():VNode {

        return h('div.jfw-main-view', [
            this.partScroller.render()
        ])
        
    }

    onClickPart(uri:string) {

        this.app.openOrphanView(new PartSummaryView(this.app as BiocadApp, uri))


    }


}
