

const CDP = require('chrome-remote-interface');

const url = process.argv.slice(2).join(' ')

//https://synbiohub.org/public/igem/BBa_J100237/1/BBa_J100237.xml
 
fs = require('fs')

console.log('hello i am the fork, url is ' + url + '--')

CDP((client) => {
    console.log('CDP initialized')
    // extract domains 
    const {Console,Network, Page, Runtime} = client;
    // setup handlers 
    Network.requestWillBeSent((params) => {
        console.log(params.request.url);
    });


Console.enable()

        Console.messageAdded((params) => {
                    console.log('messageAdded:', params.message.text);
                });

console.log('url is ' + JSON.stringify(url))

        Page.loadEventFired(() => {
            console.log('loadEventFired')
            Runtime.evaluate({
                expression: 'window.biocad_HEADLESS.headlessLoad(' + JSON.stringify(url) + ')',
                awaitPromise: true
            })
                .then((r) => {
                    console.log('evaluated headlessLoad. the result was ', r.result.value)

                    if(('' + r.result.value) === 'undefined') {
                        process.send({ err: 'biocad returned undefined' })
                    } else {
                        process.send({ res: r.result.value })
                    }
                    client.close();

                })


        })
    // enable events then start! 
    Promise.all([
        Network.enable(),
        Page.enable()
    ]).then(() => {
        return Page.navigate({url: 'file://' + __dirname + '/../dist/index.html'});
    }).catch((err) => {
        process.send({ err: err.toString() })
        console.error(err);
        client.close();
    });
}).on('error', (err) => {
        process.send({ res: err.toString() })
    // cannot connect to the remote endpoint 
    console.error(err);
});

