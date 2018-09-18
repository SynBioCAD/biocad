
export default function sortByDepth(arr, order) {

    if(order === 1) {

        return arr.sort((a, b) => {

            return b.depth - a.depth

        })

    } else {

        return arr.sort((a, b) => {

            return a.depth - b.depth

        })

    }
}


