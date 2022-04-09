
import { Dialog } from '@biocad/jfw/ui';

import extend = require('xtend')

import { h, VNode } from '@biocad/jfw/vdom'
import BiocadApp from "biocad/BiocadApp";

import { TextInput } from '@biocad/jfw/ui';
import { Combo } from '@biocad/jfw/ui';

import roles from 'data/roles'
import { Specifiers } from "bioterms";
import Button from "@biocad/jfw/ui";
import { S3Sequence, S3Component } from "sbolgraph"

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
            S3Component: null,
            sequence: null
            
        }, opts))


        const sequence:S3Sequence = opts.sequence
        const component:S3Component = opts.S3Component


        this.setTitle('Annotate Sequence')
        this.setWidthAndCalcPosition('70%')

        this.startInput = new TextInput(this, opts.annoStart)
        this.endInput = new TextInput(this, opts.annoEnd)
        this.labelInput = new TextInput(this, 'Untitled Annotation')
        this.roleInput = new Combo(this, roles, Specifiers.SO.CDS)

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

