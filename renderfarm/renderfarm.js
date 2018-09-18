
const { fork } = require('child_process')

const express = require('express')

const tmp = require('tmp-promise')

const fs = require('mz/fs')

const app = express()

const levelup = require('levelup')


const sha1 = require('sha1')

var concat = require('concat-stream');


var db = levelup('cache')


app.use(function(req, res, next) {

    var stream = req.pipe(concat(function(data){
        req.body = req.body ? (req.body + data + '') : (data + '');
    }));

	stream.on('finish', function() {
console.log('pipe finished :-)')
        next();
	})

})

app.post('/svg(/)?', function(req, res) {

    const hash = sha1(req.body)


    console.log('body: ' + req.body.substring(0, 300) + '...')
    console.log('hash: ' + sha1(req.body))

    db.get(hash, function(err, value) {

        if(value) {
            console.log('Found in cache!')

		if(value === '') { 
	res.status(500).send('')

	} else {
	res.header('content-type', 'image/svg+xml')
            res.send(value)
}
        } else {
            console.log('Not found in cache')
            tmp.tmpName().then(filename => {

                console.log('Saving SBOL temp file at ' + filename + '...')

                fs.writeFile(filename, req.body).then(() => {

                    console.log('Temp file written; forking...')




                    const child = fork(__dirname + '/renderfarm_child', [
                        'file://' + filename
                    ], {
                    })

                    child.on('message', (m) => {

                        console.log('got message from child process')

                        if(m.res) {
                            res.header('content-type', 'image/svg+xml')
                            res.send(m.res)

                            db.put(hash, m.res)
                        } else {
                            db.put(hash, '')
                            res.status(500).send('')
                        }
                    })

                })

            })

        }

    })



})

app.listen(9991)



