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
			 `https://synbiohub.org/search/objectType=ComponentDefinition&collection=${encodeURIComponent(collectionUri)}/?offset=${opts.offset}&limit=${opts.limit}`, {
			 headers: {
				 accept: 'application/json'
			 }
		 }).then(async r => {
			return await r.json()
		 }),
		 fetch(
			 `https://synbiohub.org/searchCount/objectType=ComponentDefinition&collection=${encodeURIComponent(collectionUri)}/?offset=${opts.offset}&limit=${opts.limit}`, {
			 headers: {
				 accept: 'application/json'
			 }
		 }).then(async r => {
			return await r.json()
		 })
	])

	return { rows, total: parseInt(total) }
}
