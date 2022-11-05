

import { View } from "@biocad/jfw/ui";
import { VNode, h, create, svg } from "@biocad/jfw/vdom";
import BiocadApp from "biocad/BiocadApp";

import { search, SearchResult } from 'sbh-proxy-client'

import SVGScrollerWidget, { SVGScrollerEntry } from './SVGScrollerWidget'
import LibraryView from "biocad/mode/library/LibraryView";
import { Hook } from "@biocad/jfw/util";
import BiocadProject from "../../BiocadProject";

export default class LibraryViewPartScroller extends View {


	project:BiocadProject

    results:SearchResult[]|null
    resultsSVG:SVGScrollerEntry[]

    libraryView:LibraryView

    public onClickPart:Hook<string>

    constructor(project:BiocadProject, libraryView:LibraryView) {

        super(project)

	this.project = project

        this.onClickPart = new Hook<string>()

        this.libraryView = libraryView

        this.results = null
        this.resultsSVG = []


    }

    activate() {

        //console.log('searchin')

        search().then((results:SearchResult[]) => {

            //console.log('got ' + results.length + ' results, updating!')

            this.results = results

            this.resultsSVG = this.results.map((result) => ({
                id: result.uri,
                svg: result.svg
            }))

            this.update()
        })

    }

    render():VNode {

        const onClickPart = (uri:string) => {

            this.onClickPart.fire(uri)

        }

        return h('div', [
            new SVGScrollerWidget(this.resultsSVG, onClickPart)
        ])
        
    }

}
