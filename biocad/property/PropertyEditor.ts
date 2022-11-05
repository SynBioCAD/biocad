
import { View } from '@biocad/jfw/ui'
import { Graph } from 'sboljs';

export default abstract class PropertyEditor {
    abstract render(graph:Graph)
}
