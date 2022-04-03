
import { Vec2, Rect, Matrix } from '@biocad/jfw/geom'
import { svg } from '@biocad/jfw/vdom'

var prefix = 'http://biocad.ncl.ac.uk/font/protlang/'

 import linker from './linker'
 import stability_element from './stability-element'
 import localization_tag_reversible from './localization-tag-reversible'
 import localization_tag_irreversible from './localization-tag-irreversible'
 import covalent_modification from './covalent-modification'
 import catalytic_site from './catalytic-site'
 import binding_site from './binding-site'
 import biochemical_tag from './biochemical-tag'
 import protein_cleavage_site from './protein-cleavage-site'
 import degradation_tag from './degradation-tag'
 import defined_region from './defined-region'
 import membrane_static from './membrane-static'

export default {

    prefix: prefix,

    mapping: {
        [prefix + 'linker']: linker,
        [prefix + 'stability-element']: stability_element,
        [prefix + 'localization-tag-reversible']: localization_tag_reversible,
        [prefix + 'localization-tag-irreversible']: localization_tag_irreversible,
        [prefix + 'covalent-modification']: covalent_modification,
        [prefix + 'catalytic-site']: catalytic_site,
        [prefix + 'binding-site']: binding_site,
        [prefix + 'biochemical-tag']: biochemical_tag,
        [prefix + 'protein-cleavage-site']: protein_cleavage_site,
        [prefix + 'degradation-tag']: degradation_tag,
        [prefix + 'defined-region']: defined_region,
        [prefix + 'membrane-static']: membrane_static
    }
}
