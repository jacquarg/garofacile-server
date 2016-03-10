var Writable = require('stream').Writable;
var fs = require('fs');
var express = require('express');
var router = express.Router();
var DBH = require('../database_handler');
var Busboy = require('busboy');
var JSONStream = require('JSONStream');


router.get('/config/', function(req, res, next) {
    res.render('config_server.jade', { });
});


router.post('/config/', function(req, res, next) {
    // Writable stream to put data in PouchDB.
    var ws = Writable({ objectMode: true });
    ws._write = function (chunk, enc, cb) {
        DBH.db.putIfNotExists(chunk).then(cb).catch(function(err) {
            console.log(err);
            cb()
        });
    };

    var busboy = new Busboy({ headers: req.headers });
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        file.setEncoding('utf-8');
        file.pipe(JSONStream.parse('*')).pipe(ws);

    });

    busboy.on('finish', function() {
        res.writeHead(200, { 'Connection': 'close' });
        res.end("That's all folks!");
    });

    return req.pipe(busboy);
});


router.post('/config/reset', function(req, res, next) {
    DBH.resetDB().then(function() {
        res.status(200).send("Reset done");
    }).catch(next);

});


// Export the router instance to make it available from other files.
module.exports = router;
