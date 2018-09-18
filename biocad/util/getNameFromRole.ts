
import describeSOUri from 'data/describeSOUri'

export default function getNameFromRole(role:string) {

    const igemPrefixF = 'http://wiki.synbiohub.org/wiki/Terms/igem#feature/'
    const igemPrefixPT = 'http://wiki.synbiohub.org/wiki/Terms/igem#partType/'

    if(role.startsWith(igemPrefixF)) {
        return 'igem:' + role.slice(igemPrefixF.length)
    }

    if(role.startsWith(igemPrefixPT)) {
        return 'igem:' + role.slice(igemPrefixPT.length)
    }

    const desc = describeSOUri(role)

    return desc.name


}