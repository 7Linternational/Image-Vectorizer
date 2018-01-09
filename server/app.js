var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var Vectorizer = require('./vectorizer');
var fs = require('fs');
var cors = require('cors');
var jsonfile = require('jsonfile');
var bodyParser = require('body-parser');

app.use(cors())

//app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json({ type: 'application/*+json' }))
app.use(bodyParser.json({ limit: 1024 * 1024 * 20 }));
app.use(bodyParser.urlencoded({ limit: 1024 * 1024 * 20, extended: true, parameterLimit: 5000000 }));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', function(req, res) {
    res.send('Hello World');
});

app.post('/convert', function(req, res, done) {
    var v = new Vectorizer();
    //console.log(req.query.url, req.params.url, req.body.url, req.query.cutoff, req.params.cutoff, req.body.cutoff, req.body.local);
    v.url = req.query.url || req.params.url || req.body.url || '';
    v.cutoff = req.query.cutoff || req.params.cutoff || req.body.cutoff || 5000;
    v.threshold = req.query.threshold || req.params.threshold || req.body.threshold || 40;
    v.local = req.query.local || req.params.local || req.body.local || false;

    //console.log(v.url);
    v.go(v.local, function() {
        if (v.error) {
            res.send({
                error: v.error,
            }, 400);
        } else {
            res.send({
                //url: v.url,
                cutoff: v.cutoff,
                width: v.width,
                height: v.height,
                tris: v.tris
            });
            /*var file = "sample.json";
            var obj = {
                url: v.url,
                cutoff: v.cutoff,
                width: v.width,
                height: v.height,
                tris: v.tris
            };

            jsonfile.writeFile(file, obj, function(err) {
                console.error(err);
            });*/
        }
    });
});

var server = app.listen(3000, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});