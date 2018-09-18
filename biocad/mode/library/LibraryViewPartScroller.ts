

import View from "jfw/ui/View";
import { VNode, h, create, svg } from "jfw/vdom";
import BiocadApp from "biocad/BiocadApp";

import { search, SearchResult } from 'sbh-proxy-client'

import SVGScrollerWidget, { SVGScrollerEntry } from './SVGScrollerWidget'
import LibraryView from "biocad/mode/library/LibraryView";
import Hook from "jfw/Hook";

export default class LibraryViewPartScroller extends View {

    results:SearchResult[]|null
    resultsSVG:SVGScrollerEntry[]

    libraryView:LibraryView

    public onClickPart:Hook<string>

    constructor(app:BiocadApp, libraryView:LibraryView) {

        super(app)

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

            this.app.update()
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
