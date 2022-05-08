

import { h, VNode } from "@biocad/jfw/vdom";

import { S3Component } from "sbolgraph"

import { change as changeEvent } from '@biocad/jfw/event'

import cdRoles from 'data/roles'

export default function renderCDRoleEditor(cd:S3Component) {

    return h('select', {
        'ev-change': changeEvent(onChange, { cd: cd }),
        value: 'TODO'
    }, cdRoles.map((option) => {

        return h('option', {
            value: option.value,
        }, option.name)

    }))

}

function onChange(data) {
    
    const cd:S3Component = data.cd
    const value:string = data.value

    console.log('changing type to ' + value)

    cd.addType(value)

    


}

