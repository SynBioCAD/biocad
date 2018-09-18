
export default function nameToDisplayId(name:string) {

    var displayId:string = ''

    for(var i = 0; i < name.length; ++ i) {

        if(/^[A-Za-z0-9]$/.test(name[i])) {

            displayId += name[i]

        } else {

            displayId += '_'

        }

    }

    if(/^[0-9]$/.test(name[0])) {

        displayId = '_' + displayId

    }

    return displayId

}

