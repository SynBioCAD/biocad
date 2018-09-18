
var prefix = 'http://biocad.ncl.ac.uk/font/tbt/'

import plasmid_annotation from './plasmid-annotation'
import plasmid_annotation_label from './plasmid-annotation-label'

export default {

    prefix: prefix,

    mapping: {
        [prefix + 'plasmid-annotation']: plasmid_annotation,
        [prefix + 'plasmid-annotation-label']: plasmid_annotation_label
    }
}


