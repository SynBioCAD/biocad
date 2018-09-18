
import Dialog from 'jfw/ui/dialog/Dialog'

import extend = require('xtend')

import { h, VNode } from 'jfw/vdom'
import BiocadApp from "biocad/BiocadApp";

import TextInput from 'jfw/ui/form-control/TextInput'
import Combo from 'jfw/ui/form-control/Combo'

import roles from 'data/roles'
import { Specifiers } from "bioterms";
import Button from "jfw/ui/form-control/Button";
import { SXSequence, SXComponent } from "sbolgraph"

export default class CreateAnnotationDialog extends Dialog {


    startInput:TextInput
    endInput:TextInput
    labelInput:TextInput
    roleInput:Combo
    saveButton:Button
    cancelButton:Button

    constructor(app:BiocadApp, opts:any) {

        super(app, extend({

            modal: true,
            annoStart: 0,
            annoEnd: 0,
            SXComponent: null,
            sequence: null
            
        }, opts))


        const sequence:SXSequence = opts.sequence
        const component:SXComponent = opts.SXComponent


        this.setTitle('Annotate Sequence')
        this.setWidthAndCalcPosition('70%')

        this.startInput = new TextInput(this, opts.annoStart)
        this.endInput = new TextInput(this, opts.annoEnd)
        this.labelInput = new TextInput(this, 'Untitled Annotation')
        this.roleInput = new Combo(this, roles, Specifiers.SBOL2.Role.CDS)

        this.saveButton = new Button(this)
        this.saveButton.setText('Save')

        this.saveButton.onClick(() => {


        })


        this.cancelButton = new Button(this)
        this.cancelButton.setText('Cancel')

        this.cancelButton.onClick(() => {
            this.app.closeDialog(this)
        })
    }


    getContentView():VNode {

        return h('div', [
            h('label', 'Start'),
            h('br'),
            this.startInput.render(),
            h('br'),
            h('br'),

            h('label', 'End'),
            h('br'),
            this.endInput.render(),
            h('br'),
            h('br'),

            h('label', 'Label'),
            h('br'),
            this.labelInput.render(),
            h('br'),
            h('br'),

            h('label', 'Role'),
            h('br'),
            this.roleInput.render(),
            h('br'),
            h('br'),

            this.saveButton.render(),
            this.cancelButton.render(),

        ])
    }

}

