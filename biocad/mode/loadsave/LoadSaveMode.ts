
import LoadSaveView from './LoadSaveView'
import Mode from 'jfw/ui/Mode'
import { VNode, h } from "jfw/vdom";
import { App } from "jfw";

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


