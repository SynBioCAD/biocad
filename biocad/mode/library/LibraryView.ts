
import { View } from "@biocad/jfw/ui";
import { VNode, h, create, svg } from "@biocad/jfw/vdom";
import BiocadApp from "biocad/BiocadApp";

import { search, SearchResult } from 'sbh-proxy-client'

import SVGScrollerWidget from './SVGScrollerWidget'
import LibraryViewPartScroller from "biocad/mode/library/LibraryViewPartScroller";
import PartSummaryView from "biocad/mode/library/PartSummaryView";
import BiocadProject from "../../BiocadProject";

export default class LibraryView extends View {

	project:BiocadProject

    partScroller:LibraryViewPartScroller

    constructor(project:BiocadProject) {

        super(project)

	this.project = project

        this.partScroller = new LibraryViewPartScroller(project, this)

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

        this.project.openOrphanView(new PartSummaryView(this.project, uri))


    }


}
