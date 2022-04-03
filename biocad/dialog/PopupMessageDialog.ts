
import { Dialog, DialogOptions } from '@biocad/jfw/ui/dialog'
import { h } from '@biocad/jfw/vdom'

export default class PopupMessageDialog extends Dialog {

    message:any

    constructor(app, title:string, message:any, opts:DialogOptions) {

        super(app, opts)

        this.message = message
        this.setTitle(title)
    }

    getContentView() {

        return h('div', this.message.toString())

    }
}


