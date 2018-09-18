
const TrieSearch = require('trie-search')

var soTrie = new TrieSearch('name', {
    splitOnRegEx: /\s|_/g
})

import so from './sequence-ontology'


console.time('build so trie')

var n = 0

for(var k in so) {

    soTrie.add({
        term: k,
        name: so[k].name
    })

    ++ n

}

console.timeEnd('build so trie')

console.log('so trie has ' + n + ' things')

export default soTrie





