
var express = require('express')
var request = require('request')
var levelup = require('levelup')
var fs = require('fs')

var app = express()



//var sbhUrl = 'https://synbiohub.org'
var sbhUrl = 'https://synbiohub.ico2s.org:7777'

var cache = levelup('./cache')

app.all('/search', function(req, res) {

		res.header('content-type', 'application/json')
		res.header('access-control-allow-origin', '*')
	res.send(fs.readFileSync('./fakeresponse.json') + '')
return

    request({
        method: req.method,
        url: sbhUrl + '/search',
	headers: {
		accept: 'application/json'
	}
    }, function(err, response, body) {

	const results = JSON.parse(body)

	attachSVG(results).then(() => {

		res.header('content-type', 'application/json')
		res.header('access-control-allow-origin', '*')
		res.send(JSON.stringify(results, null, 2))

	})
	

    })

})

app.listen(9992)

function attachSVG(results) {

var numProc = 0

return new Promise((resolve, reject) => {

	for(var i = 0; i < results.length; ++ i) {

		attach(i)

	}

	function attach(i) {

		const result = results[i]

		getSBOL(result.uri).then((sbol) => {

			    console.log('got sbol, its ' + sbol.substring(0, 1000))
			console.log('Getting SVG for ' + result.uri)

			request({
				method: 'post',
				url: 'http://api.biocad.io/render/svg/',
				body: sbol
			}, function(err, res, body) {

				if(!err && res.statusCode < 300) {
				    console.log('got SVG')
				    result.svg = body
				} else {
				    console.log('couldnt get SVG')
				    console.log(res.statusCode)
				    console.log(body)
				    result.svg = ''
				}

				++ numProc

				if(numProc === results.length) {
					resolve()

				}

			})

		})
	}


})

}

function getSBOL(uri) {


	console.log('Getting SBOL for: ' + uri)

	return new Promise((resolve, reject) => {

		request.get(uri + '/sbol', function(err, res, body) {
			if(err) reject(err)
            else if(res.statusCode >= 300) reject(new Error('http ' + res.statusCode))
			else resolve(body)
		})
	})

}



