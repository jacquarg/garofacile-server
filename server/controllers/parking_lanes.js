var express = require('express');
var router = express.Router();

var DBH = require('../database_handler');


// call with parkinglanes/?bbox=[minLat, minLon, maxLat, maxLon]'
router.get('/public/parkinglanes/', function(req, res, next) {
    if (!req.query.bbox) {
        return res.status(400).send("Requires bbox=[minLat, minLon, maxLat, maxLon] parameter.");
    }

    var bbox = JSON.parse(req.query.bbox);
    DBH.db.spatial('parkinglane/byPoint', bbox, { include_docs: true }).then(function(resultRows) {
        var docs = resultRows.map(function(row) { return row.doc; });
        res.status(200).json(docs);
    }).catch(next);
});


router.get('/public/byid/:id', function(req, res, next) {
    DBH.db.get(req.params.id).then(function(doc) {
        res.status(200).json(doc);
    }).catch(next);

});


router.get('/parkinglanes/all', function(req, res, next) {
    DBH.db.allDocs({ include_docs: true }).then(function(resultRows) {
        res.status(200).json(resultRows);
    }).catch(next);
});


// Export the router instance to make it available from other files.
module.exports = router;
