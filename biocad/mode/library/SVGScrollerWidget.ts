
import { Hook } from "jfw/util";

const svgNS = 'http://www.w3.org/2000/svg'

export class SVGScrollerEntry {
    id:string
    svg:string
}

class SVGScrollerWidget {

    entries:SVGScrollerEntry[]

    thumbnailHeight:number = 100
    zoomedHeight:number = 200
    animationSpeed:number = 1
    indent:number = 50

    public onClickEntry:Hook<string>

    constructor(entries:SVGScrollerEntry[], onClickEntry:(id:string)=>void) {

        this.entries = entries

        this.onClickEntry = new Hook<string>()
        this.onClickEntry.listen(onClickEntry)

    }

    init() {

        //console.log('initting with ' + this.entries.length + ' entries')

        const container = document.createElement('div')
        container.style.overflowY = 'visible'
        container.style.overflowX = 'hidden'

        var svgElements:SVGElement[] = []

        for(let entry of this.entries) {

            const n = svgElements.length

            const svgContainer = document.createElement('div')
            svgContainer.style.display = 'block'

            svgContainer.innerHTML = entry.svg

            svgContainer.onclick = () => {
                this.onClickEntry.fire(entry.id)
            }

            if(svgContainer.firstElementChild && svgContainer.firstElementChild instanceof SVGElement) {

                const svgElement = svgContainer.firstElementChild as SVGElement

                svgElement.style.height = this.thumbnailHeight.toString() + 'px';
                svgElement.removeAttribute('width');
                svgElement.removeAttribute('height');
                svgElement.classList.add('sf-svgscroller')

                svgElement['_sfTargetHeight'] = this.thumbnailHeight
                svgElement['_sfCurrentHeight'] = this.thumbnailHeight
                svgElement['_sfCurrentLeft'] = 0
                svgElement['_sfTargetLeft'] = 0
                svgElement['_sfAccelW'] = 1.0
                svgElement['_sfAccelH'] = 1.0

                svgElement.onmouseover = () => {

                    for(var i = 0; i < svgElements.length; ++ i) {

                        const element = svgElements[i]

                        if(i === n) {
                            element['_sfTargetHeight'] = 200
                            element['_sfTargetLeft'] = this.indent * 2
                            element['_sfAccelW'] = 1.0
                            element['_sfAccelH'] = 1.0
                        } else if(i === n - 1) {
                            element['_sfTargetHeight'] = 150
                            element['_sfTargetLeft'] = this.indent
                            element['_sfAccelW'] = 1.0
                            element['_sfAccelH'] = 1.0
                        } else if(i === n + 1) {
                            element['_sfTargetHeight'] = 150
                            element['_sfTargetLeft'] = this.indent
                            element['_sfAccelW'] = 1.0
                            element['_sfAccelH'] = 1.0
                        } else {
                            element['_sfTargetHeight'] = this.thumbnailHeight
                            element['_sfTargetLeft'] = 0
                            element['_sfAccelW'] = 1.0
                            element['_sfAccelH'] = 1.0
                        }
                    }

                    this.animate()
                }

                svgElements.push(svgElement)

            }

            container.onmouseout = () => {

                for(var i = 0; i < svgElements.length; ++ i) {

                    const element = svgElements[i]

                    element['_sfTargetHeight'] = this.thumbnailHeight
                    element['_sfTargetLeft'] = 0
                    element['_sfAccelW'] = 1.0
                    element['_sfAccelH'] = 1.0
                }

                this.animate()
            }

            container.appendChild(svgContainer)

        }


        container.style.display = 'inline-block'

        return container
    }

    private animate() {

        window.requestAnimationFrame(() => {

            const elements = document.getElementsByClassName('sf-svgscroller')

            var movedAnything = false

            for(var i = 0; i < elements.length; ++ i) {

                const element = elements[i]

                const targHeight = element['_sfTargetHeight']
                const curHeight = element['_sfCurrentHeight']

                const targLeft = element['_sfTargetLeft']
                const curLeft = element['_sfCurrentLeft']

                const accelW = element['_sfAccelW'];
                const accelH = element['_sfAccelH'];

                if(targHeight !== curHeight) {

                    movedAnything = true

                    var newHeight

                    if(targHeight < curHeight) {
                        newHeight = Math.max(curHeight - (this.animationSpeed * accelH), targHeight)
                    } else if(targHeight > curHeight) {
                        newHeight = Math.min(curHeight + (this.animationSpeed * accelH), targHeight)
                    } else {
                        newHeight = 20
                    }

                    element['_sfCurrentHeight'] = newHeight
                    element['_sfAccelH'] = (accelH * 1.3);
                    ;(element as SVGElement).style.height = newHeight + 'px'

                } else {
                    element['_sfAccelH'] = 1.0;

                }

                if (targLeft !== curLeft) {

                    movedAnything = true

                    var newLeft

                    if(targLeft < curLeft) {
                        newLeft = Math.max(curLeft - (this.animationSpeed * accelW), targLeft)
                    } else if(targLeft > curLeft) {
                        newLeft = Math.min(curLeft + (this.animationSpeed + accelW), targLeft)
                    } else {
                        newLeft = 20
                    }

                    element['_sfCurrentLeft'] = newLeft
                    element['_sfAccelW'] = (accelW * 1.3);
                    ;(element as SVGElement).style['paddingLeft'] = newLeft + 'px'

                } else {
                    element['_sfAccelW'] = 1.0;
                }

            }

            if(movedAnything) {
                this.animate()
            }

        })

    }
    update(prev, elem) {

        //elem.innerHTML = 'Content set directly on real DOM node, by widget ' +
        //'<em>after</em> update.'

        if(this.entries !== prev.entries) {

            return this.init()

        }
    }


}


SVGScrollerWidget.prototype['type'] = 'Widget'

export default SVGScrollerWidget

