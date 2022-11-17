import Repo from "../Repository"


export interface RepoSearchOptions {
	offset:number
	limit:number
	sortBy:string
	sortOrder:'asc'|'desc'
	filter:string
}

export async function getComponents(collectionUri:string, opts:RepoSearchOptions) {

	let [ rows, total ] = await Promise.all([
		 fetch(
			 `https://synbiohub.org/search/?objectType=ComponentDefinition&collection=${encodeURIComponent(collectionUri)}`, {
			 headers: {
				 accept: 'application/json'
			 }
		 }).then(async r => {
			return await r.json()
		 }),
		 fetch(
			 `https://synbiohub.org/searchCount/?objectType=ComponentDefinition&collection=${encodeURIComponent(collectionUri)}`, {
			 headers: {
				 accept: 'application/json'
			 }
		 }).then(async r => {
			return await r.json()
		 })
	])

	return { rows, total: parseInt(total) }
}

async function doCount(query:string) {
	let res = await fetch('https://synbiohub.org/sparql?query=' + encodeURIComponent(query), {
		headers: {
			accept: 'application/json'
		}
	})
	let json = await res.json()
	if (!json || JSON.stringify(json) === '{}')
		return null
	return parseInt(json.results.bindings[0].count.value)
}


function ComponentsQuery(uri:string, opts:RepoSearchOptions) {

	let sortPredicate = opts.sortBy || 'http://purl.org/dc/terms/title'

	return ` PREFIX sbol: <http://sbols.org/v2#>
		PREFIX dcterms: <http://purl.org/dc/terms/>
		PREFIX sbh: <http://wiki.synbiohub.org/wiki/Terms/synbiohub#>
		CONSTRUCT {
		<${uri}> sbol:member ?s .
		?s a <http://sbols.org/v2#ComponentDefinition> .
		?s sbol:displayId ?displayId .
		?s dcterms:title ?title .
		?s dcterms:description ?description .
		?s dcterms:created ?created .
		?s dcterms:modified ?modified .
		?s sbh:ownedBy ?ownedBy .
		?s sbol:role ?role .
		?s sbol:encoding ?encoding .
		} WHERE {
		<${uri}> sbol:member ?s .
		?s a <http://sbols.org/v2#ComponentDefinition> .
		?s sbol:displayId ?displayId .
		?s <${sortPredicate}> ?sort .
		OPTIONAL { ?s dcterms:created ?created . }
		OPTIONAL { ?s dcterms:modified ?modified . }
		OPTIONAL { ?s dcterms:title ?title . }
		OPTIONAL { ?s dcterms:description ?description . }
		OPTIONAL { ?s sbol:role ?role . }
		} 
		ORDER BY ${opts.sortBy === 'asc' ? 'ASC' : 'DESC'}(?sort) 
		OFFSET ${opts.offset}
		LIMIT ${opts.limit}
		${opts.filter ? sparqlFilterFromSearchQuery('?s', opts.filter) : ''}
	`

		// OPTIONAL { ?s sbh:ownedBy ?ownedBy . }
		// OPTIONAL { ?s sbol:encoding ?encoding . }
}

function ComponentsCountQuery(uri:string, opts:RepoSearchOptions) {

	return ` PREFIX sbol: <http://sbols.org/v2#>
		PREFIX dcterms: <http://purl.org/dc/terms/>
		PREFIX sbh: <http://wiki.synbiohub.org/wiki/Terms/synbiohub#>
		SELECT (count(DISTINCT ?s) AS ?count) WHERE {
		<${uri}> sbol:member ?s .
		?s a <http://sbols.org/v2#ComponentDefinition> .
		?s sbol:displayId ?displayId .
		OPTIONAL { ?s dcterms:created ?created . }
		OPTIONAL { ?s dcterms:modified ?modified . }
		OPTIONAL { ?s dcterms:title ?title . }
		OPTIONAL { ?s dcterms:description ?description . }
		OPTIONAL { ?s sbol:role ?role . }
		${opts.filter ? sparqlFilterFromSearchQuery('?s', opts.filter) : ''}
		} 
		`
}

function SequencesQuery(uri:string, offset:number, limit:number) {

	return ` PREFIX sbol: <http://sbols.org/v2#>
		PREFIX dcterms: <http://purl.org/dc/terms/>
		PREFIX sbh: <http://wiki.synbiohub.org/wiki/Terms/synbiohub#>
		CONSTRUCT {
		<${uri}> sbol:member ?s .
		?s a <http://sbols.org/v2#Sequence> .
		?s sbol:displayId ?displayId .
		?s dcterms:title ?title .
		?s dcterms:description ?description .
		?s dcterms:created ?created .
		?s dcterms:modified ?modified .
		?s sbh:ownedBy ?ownedBy .
		?s sbol:encoding ?encoding .
		} WHERE {
		<${uri}> sbol:member ?s .
		?s a <http://sbols.org/v2#Sequence> .
		?s sbol:displayId ?displayId .
		?s sbol:encoding ?encoding .
		OPTIONAL { ?s dcterms:created ?created . }
		OPTIONAL { ?s dcterms:modified ?modified . }
		OPTIONAL { ?s dcterms:title ?title . }
		OPTIONAL { ?s dcterms:description ?description . }
		} 
		OFFSET ${offset}
		LIMIT ${limit}
	`

		// OPTIONAL { ?s sbh:ownedBy ?ownedBy . }
		// OPTIONAL { ?s sbol:encoding ?encoding . }

		// ${searchQuery ? sparqlFilterFromSearchQuery('?s', searchQuery) : ''}
		// ${searchQuery ? sparqlBindOrderPredicateFromSearchQuery('?s', searchQuery) : ''}
}

function ModulesQuery(uri:string, offset:number, limit:number) {

	return ` PREFIX sbol: <http://sbols.org/v2#>
		PREFIX dcterms: <http://purl.org/dc/terms/>
		PREFIX sbh: <http://wiki.synbiohub.org/wiki/Terms/synbiohub#>
		CONSTRUCT {
		<${uri}> sbol:member ?s .
		?s a <http://sbols.org/v2#ModuleDefinition> .
		?s sbol:displayId ?displayId .
		?s dcterms:title ?title .
		?s dcterms:description ?description .
		?s dcterms:created ?created .
		?s dcterms:modified ?modified .
		?s sbh:ownedBy ?ownedBy .
		?s sbol:role ?role .
		} WHERE {
		<${uri}> sbol:member ?s .
		?s a <http://sbols.org/v2#ModuleDefinition> .
		?s sbol:displayId ?displayId .
		OPTIONAL { ?s dcterms:created ?created . }
		OPTIONAL { ?s dcterms:modified ?modified . }
		OPTIONAL { ?s dcterms:title ?title . }
		OPTIONAL { ?s dcterms:description ?description . }
		OPTIONAL { ?s sbol:role ?role . }
		} 
		OFFSET ${offset}
		LIMIT ${limit}
	`

		// OPTIONAL { ?s sbh:ownedBy ?ownedBy . }
		// OPTIONAL { ?s sbol:encoding ?encoding . }

		// ${searchQuery ? sparqlFilterFromSearchQuery('?s', searchQuery) : ''}
		// ${searchQuery ? sparqlBindOrderPredicateFromSearchQuery('?s', searchQuery) : ''}
}

function CollectionsQuery(uri:string, offset:number, limit:number) {

	return ` PREFIX sbol: <http://sbols.org/v2#>
		PREFIX dcterms: <http://purl.org/dc/terms/>
		PREFIX sbh: <http://wiki.synbiohub.org/wiki/Terms/synbiohub#>
		CONSTRUCT {
		<${uri}> sbol:member ?s .
		?s a <http://sbols.org/v2#Collection> .
		?s sbol:displayId ?displayId .
		?s dcterms:title ?title .
		?s dcterms:description ?description .
		?s dcterms:created ?created .
		?s dcterms:modified ?modified .
		?s sbh:ownedBy ?ownedBy .
		} WHERE {
		<${uri}> sbol:member ?s .
		?s a <http://sbols.org/v2#Collection> .
		?s sbol:displayId ?displayId .
		OPTIONAL { ?s dcterms:created ?created . }
		OPTIONAL { ?s dcterms:modified ?modified . }
		OPTIONAL { ?s dcterms:title ?title . }
		OPTIONAL { ?s dcterms:description ?description . }
		} 
		OFFSET ${offset}
		LIMIT ${limit}
	`

		// OPTIONAL { ?s sbh:ownedBy ?ownedBy . }
		// OPTIONAL { ?s sbol:encoding ?encoding . }

		// ${searchQuery ? sparqlFilterFromSearchQuery('?s', searchQuery) : ''}
		// ${searchQuery ? sparqlBindOrderPredicateFromSearchQuery('?s', searchQuery) : ''}
}

function sparqlFilterFromSearchQuery(subject:string, searchQuery:any):string {

	return `FILTER(
		CONTAINS(lcase(str(${subject})), lcase(${searchQuery})) ||
		CONTAINS(lcase(?displayId), lcase(${searchQuery})) ||
		CONTAINS(lcase(?title), lcase(${searchQuery})) ||
		CONTAINS(lcase(?description), lcase(${searchQuery}))
	)`
}

