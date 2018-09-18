
import Combo from 'jfw/ui/form-control/Combo'

import { Specifiers } from 'bioterms'
import { h, VNode } from "jfw/vdom";

import { SXComponent } from "sbolgraph"

import { change as changeEvent } from 'jfw/event'

export default function renderCDStrandChooser(cd:SXComponent) {

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
    
    const cd:SXComponent = data.cd
    const value:string = data.value

    console.log('changing strand to ' + value)

    //cd.type = value

    // TODO
    


}

