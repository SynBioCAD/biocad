
import { Dialog } from 'jfw/ui/dialog'
import { DialogOptions } from 'jfw/ui/dialog'
import { h } from 'jfw/vdom'

export default class PopupMessageDialog extends Dialog {

    message:string

    constructor(app, title:string, message:string, opts:DialogOptions) {

        super(app, opts)

        this.setTitle(title)

        this.message = message

    }

    getContentView() {

        return h('div', this.message)

    }
}


