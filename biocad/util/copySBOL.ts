
import { Predicates } from 'bioterms'
import { Graph, S3Identified, sbol3, node, triple, rdf } from 'sbolgraph'


// All the SBOL is copied but only things speciifed by topLevelURIs get renamed

// - Need to change their owned objects too

// TODO

export default function copySBOL(graphA:Graph, graphB:Graph, newURIPrefix:string):Map<string,string> {

    let intmGraph = graphA.clone()
    
    let identityMap:Map<string,string> = sbol3(intmGraph).changeURIPrefix(newURIPrefix)

    for(let topLevel of sbol3(intmGraph).topLevels) {
        let n = 1

        let origUri = topLevel.uri
        let newUri = topLevel.uri

	if(!graphB.hasMatch(newUri, null, null)) {
		continue
	}

        while(graphB.hasMatch(newUri, null, null)) {
            ++ n
            newUri = origUri + '_' + n
        }

        intmGraph = intmGraph.map(t => {
		let { subject, predicate, object } = t
		if(node.isUri(subject)) {
			let uri = subject.value
			if (uri && uri.startsWith(origUri)) {
				let subject2 = newUri + uri.slice(origUri.length)
				identityMap.set(uri, subject2)
				subject = node.createUriNode(subject2)
			}
		}
		if(node.isUri(object)) {
			let uri2 = object.value
			if (uri2 && uri2.startsWith(origUri)) {
				let object2 = newUri + uri2.slice(origUri.length)
				identityMap.set(uri2, object2)
				object = node.createUriNode(object2)
			}
		}
		return triple.fromSPO(subject, predicate, object)
	})

        identityMap.set(origUri, newUri)
    }


    /// update displayIds
    //
    for(let oldUri of identityMap.keys()) {

	let newUri = identityMap.get(oldUri)!

	let newDisplayId = newUri.split('/').pop()!

	if(intmGraph.hasMatch(node.createUriNode(newUri), node.createUriNode(Predicates.SBOL3.displayId), null)) {
		intmGraph.removeMatches(node.createUriNode(newUri), node.createUriNode(Predicates.SBOL3.displayId), null)
		intmGraph.insertTriple(node.createUriNode(newUri), node.createUriNode(Predicates.SBOL3.displayId), node.createStringNode(newDisplayId))
	}
    }



    graphB.addAll(intmGraph)

    return identityMap
}





