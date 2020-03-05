
import Combo from 'jfw/ui/form-control/Combo'

import { Specifiers } from 'bioterms'
import { h, VNode } from "jfw/vdom";

import { S3Component } from "sbolgraph"

import { change as changeEvent } from 'jfw/event'

import cdTypes from 'data/cdTypes'

export default function renderCDTypeChooser(cd:S3Component) {


    return h('select.jfw-select', {
        'ev-change': changeEvent(onChange, { cd: cd }),
        value: 'TODO'
    }, cdTypes.map((option) => {

        return h('option', {
            value: option.value,
        }, option.name)

    }))

}

function onChange(data) {
    
    const cd:S3Component = data.cd
    const value:string = data.value

    console.log('changing type to ' + value)

    //cd.type = value

    


}

