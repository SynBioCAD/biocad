
import { Prefixes, Specifiers } from 'bioterms'
import Glyph from 'biocad/glyph/Glyph';
import SequenceOntology from './sequence-ontology'

let parentMap = new Map()

for (let term of Object.keys(SequenceOntology)) {
	let t = SequenceOntology[term]
	if (t.children) {
		for (let child of t.children) {
			let exist = parentMap.get(child)
			if(exist) {
				exist.push(term)
			} else {
				parentMap.set(child, [term])
			}
		}
	}
}


export function shortNameFromTerm(uri:string) {

    return soToGlyphType('SO:' + uri.split('SO:')[1])
                || soToGlyphType('GO:' + uri.split('GO:')[1]) 
                || soToGlyphType('SO:' + uri.split('SO_')[1]) 
                || soToGlyphType('GO:' + uri.split('GO_')[1]) 
                || ''
}

function soToGlyphType(so) {

    let glyphs = Glyph.glyphs

    for(var i = 0; i < glyphs.length; ++ i) {

        for(let term of glyphs[i].soTerms) {

            if(term.indexOf('SO:') !== -1) {
                if(term.split('SO:')[1] === so.split('SO:')[1]) {
                    return glyphs[i].glyphName
                }
            }

            if(term.indexOf('GO:') !== -1) {
                if(term.split('GO:')[1] === so.split('GO:')[1]) {
                    return glyphs[i].glyphName
                }
            }
        }
    }

    let parents = parentMap.get(so)

    if(parents) {
	    for(let p of parents) {
		    let match = soToGlyphType(p)
		    if(match !== 'Unspecified') {
			    return match
		    }
	    }
    }

    return 'Unspecified'
}


