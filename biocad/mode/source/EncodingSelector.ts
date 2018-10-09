
import { VNode, h } from 'jfw/vdom'
import { View } from 'jfw/ui'
import { App } from 'jfw'
import { click as clickEvent } from 'jfw/event'

export enum Encoding {
    SBOLX,
    SBOLXGraph,
    SBOL2,
    SBOL2Graph
}

let encodingNames:string[] =
    Object.keys(Encoding).filter((k) => typeof Encoding[k] === 'number') as string[]

export default class EncodingSelector extends View {

    currentEncoding:Encoding
    onChangeEncoding:(encoding:Encoding)=>void

    constructor(app:App) {
        super(app)
        this.currentEncoding = Encoding.SBOLX
    }

    render():VNode {

        let elems:VNode[] = []

        for(let encodingName of encodingNames) {
            let encoding = Encoding[encodingName]
            let selected = this.currentEncoding === encoding
            elems.push(h('div' + (selected ? '.active' : ''), {
                'ev-click': clickEvent(onClickEncoding, { encoding: encoding, view: this })
            },  encodingName))
        }

        return h('div.sf-encoding-selector', elems)

    }


}

function onClickEncoding(data) {

    let view = data.view

    view.currentEncoding = data.encoding
    view.onChangeEncoding(data.encoding)
    view.update()

}