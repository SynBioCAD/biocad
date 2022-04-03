

import App from '../../BiocadApp'

import HeadlessView from './HeadlessView'

import Mode from '@biocad/jfw/ui/Mode'
import { VNode, h } from "jfw/vdom";

export default class HeadlessMode extends Mode {

    constructor(app:App, active:boolean) {

        const view:HeadlessView = new HeadlessView(app)

        super(
            app,
            active,
            view,
            null,
            null
        )

    }

    getName():VNode {
        return h('span', 'Headless Mode')
    }

}


