
import sequenceOntology from './sequence-ontology'

export default function describeSOUri(uri:string): { name:string, desc:string } {

    var term = uri.split('SO:')[1]

    if(term)
        term = 'SO:' + term

    const mapping = sequenceOntology[term]

    if(!mapping) {
        return {
            name: term ? term : uri,
            desc: ''
        }
    }

    return {
        name: mapping.name,
        desc: mapping.def || ''
    }
}

