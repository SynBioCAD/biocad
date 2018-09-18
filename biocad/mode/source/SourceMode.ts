
import App from '../../BiocadApp'

import SourceView from './SourceView'

import Mode from 'jfw/ui/Mode'
import { VNode, h } from "jfw/vdom";

export default class SequenceViewMode extends Mode {

    constructor(app:App, active:boolean) {

        super(
            app,
            active,
            new SourceView(app),
            null,
            null
        )

    }

    getName():VNode {
        return h('span.fa.fa-file-text-o', '')
    }

}


