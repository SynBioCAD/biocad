
import { View } from '@biocad/jfw/ui'
import LayoutEditor from './LayoutEditor';
import { h } from '@biocad/jfw/vdom';

export default class LayoutEditorDebugLog extends View {

    messages:Array<{ message:string }>

    constructor(layoutEditor:LayoutEditor) {
        super(layoutEditor.project)
        this.messages = []
    }

    render() {
        return h('div.sf-circuit-view-debug', {
            style: {
                'pointer-events': 'none'
            }
        }, this.messages.map((message) => {
            return h('div', {
                style: {
                }
             },  message.message)
        }))
    }

    log(message:string) {

        let msg = { message }

        this.messages.unshift(msg)

        setTimeout(() => {
            this.messages.splice(this.messages.indexOf(msg), 1)
            this.update()
        }, 1000)
    }

}