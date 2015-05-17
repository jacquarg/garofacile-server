
var that = {};

that.ways = {};
that.nodes = {};

module.exports.around = function(req, res) {
    var point = {
        lat: parseFloat(req.query.lat),
        lon: parseFloat(req.query.lon),
    };
    that.getLanesAround(point, function(err, segments) {
        if (err) {
            res.send(500, err);
        } else {
            res.send(200, segments);
        }
    });
};

that.getLanesAround = function(point, callback) {

    var radius = 0.005; // 10E-5 ~ 1m

    // filter ways around the specified point

    var wayInCircle = function(way, point, radius) {
        return way.nodes.some(function(n) {
            var lat = parseFloat(n.lat);
            var lon = parseFloat(n.lon);
            return (lat > (point.lat - radius) && lat < (point.lat + radius)
            && lon > (point.lon - radius) && lon < (point.lon + radius));
        });
    };

    var segments = [];
    var key, way;
    for (key in that.ways) {
        way = that.ways[key];
        if (wayInCircle(way, point, radius)) {
            segments.push(that.way2LatLons(way));
        }
    }

    callback(null, segments);
};

that.way2LatLons = function(way) {
    return way.nodes.map(function(node) {
        return [node.lat, node.lon];
    });
};

that.storeOSMData = function(rawData) {
    rawData.elements.forEach(function(elem) {
        if (elem.type == "node") {
            that.nodes[elem.id] = elem;

        } else if (elem.type == "way") {
            // If a node is missing, skip the way.
            var nodesObjs = [];
            for (var i = 0; i<elem.nodes.length; i++) {
                var id = elem.nodes[i];
                if (that.nodes[id] == undefined) {
                    console.log("missing node : " + id);
                    return; // skip this way.
                }
                nodesObjs.push(that.nodes[id]);
            }

            //var nodesObjs = elem.nodes.map(function(id) {
            //    if (that.nodes[id] == undefined) { console.log(id); }
            //    return that.nodes[id]; });

            that.ways[elem.id] = elem ;
            elem.nodes = nodesObjs;
        }
    });
};


that.initData = function( ) {
    console.log("initData");
    var rawData = require('../data/parkinglane_paris.json');
    console.log("done require data.");

    that.storeOSMData(rawData);
    console.log("done store data.");

};

that.initData();
