
import { View } from '@biocad/jfw/ui'
import { Graph } from 'sbolgraph';

export default abstract class PropertyEditor {
    abstract render(graph:Graph)
}
