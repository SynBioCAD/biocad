
import LoadSaveView from './LoadSaveView'
import { Mode } from '@biocad/jfw/ui';
import { VNode, h } from "@biocad/jfw/vdom";
import { App } from "@biocad/jfw";

export default class LoadSaveMode extends Mode {

    constructor(app:App, active:boolean) {

        super(
            app,
            active,
            new LoadSaveView(app),
            null,
            null
        )

    }

    getName():VNode {
        return h('span.fa.fa-save', '')
    }

}


