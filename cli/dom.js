
import {JSDOM } from 'jsdom'

let dom = new JSDOM()

let document = dom.window.document
let window = dom.window
let navigator = dom.window.navigator

export { document, window, navigator }


