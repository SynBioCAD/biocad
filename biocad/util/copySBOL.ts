
import { Predicates } from 'bioterms'
import { Graph, S3Identified, sbol3, node, triple } from 'sboljs'


// All the SBOL is copied but only things speciifed by topLevelURIs get renamed

// - Need to change their owned objects too

// TODO

export default function copySBOL(graphA:Graph, graphB:Graph, newURIPrefix:string):Map<string,string> {

    console.log('copySBOL before copying')
    console.log('graphA')
    console.log(graphA.serializeXML())
    console.log('graphB')
    console.log(graphB.serializeXML())

    let intmGraph:Graph = graphA.clone()
    
    console.log('intmGraph = graphA.clone()')
    console.log(intmGraph.serializeXML())

    let identityMap:Map<string,string> = sbol3(intmGraph).changeURIPrefix(newURIPrefix)

    console.log('intmGraph after changeURIPrefix to ' + newURIPrefix)
    console.log(intmGraph.serializeXML())

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

	if(!newUri) {
		throw new Error('newUri was null')
	}

	let newDisplayId = newUri.split('/').pop()!

	if(!newDisplayId) {
		// uri of a namespace?
		continue;
	}

	if(intmGraph.hasMatch(node.createUriNode(newUri), node.createUriNode(Predicates.SBOL3.displayId), null)) {
		intmGraph.removeMatches(node.createUriNode(newUri), node.createUriNode(Predicates.SBOL3.displayId), null)
		intmGraph.insertTriple(node.createUriNode(newUri), node.createUriNode(Predicates.SBOL3.displayId), node.createStringNode(newDisplayId))
	}

    }



    console.log('copySBOL intmGraph before adding it to graphB')
    console.log(intmGraph.serializeXML())
    graphB.addAll(intmGraph)


    console.log('copySBOL finished copying')
    console.log('graphA')
    console.log(graphA.serializeXML())
    console.log('graphB')
    console.log(graphB.serializeXML())

    return identityMap
}





