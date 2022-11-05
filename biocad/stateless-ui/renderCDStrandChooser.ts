
import { Specifiers } from 'bioterms'
import { h, VNode } from "@biocad/jfw/vdom";

import { S3Component } from "sboljs"

import { change as changeEvent } from '@biocad/jfw/event'

export default function renderCDStrandChooser(cd:S3Component) {

    const options = [
        {
            name: 'Forward',
            value: Specifiers.SBOL2.Orientation.Inline
        },
        {
            name: 'Reverse Complement',
            value: Specifiers.SBOL2.Orientation.ReverseComplement
        }
    ]

    return h('select.jfw-select', {
        'ev-change': changeEvent(onChange, { cd: cd }),
        value: 'TODO'
    }, options.map((option) => {

        return h('option', {
            value: option.value,
        }, option.name)

    }))

}

function onChange(data) {
    
    const cd:S3Component = data.cd
    const value:string = data.value

    console.log('changing strand to ' + value)

    //cd.type = value

    // TODO
    


}

