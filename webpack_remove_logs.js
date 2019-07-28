
module.exports = function(source) {
    return source.replace(/console\.[A-z]+\(.*\)/g, ';undefined;')
}

