var OSMVT = require('../../lib/osm_vector_tools');
var JSONStream = require('JSONStream');
var fs = require("fs");
var G = require('../../lib/geo_tools');


// require files

var osm = require('/home/jacquarg/workspace/Garofacile/rawdata/osm_extract_paul_bert_around.json');

// // Prepare osm data

// Nodes in dict.
// Serialize nodes in way
OSMVT.storeOSMData(osm);

// Index on street names
waysByName = {};
for (wId in OSMVT.ways) {
    var way = OSMVT.ways[wId];
    var name = way.tags.name;
    if (!name) { name = 'unnamed' };

    name = name.toLowerCase();
    if (!(name in waysByName)) {
        waysByName[name] = [];
    }
    waysByName[name].push(way);
}


// // Convert

// Project a statioment on a same name ways list.
// @param geo2d (barycenter), length of the stationment lane
// @param ways a street list of ways with the same name.
// @return list of parkingLane object,
var projectOnWays = function(ways, centerPoint, length) {
    //1 get the segment of the center (point)
    var closestSegment = OSMVT.closestWay(ways, G.latLon2Point(dataset.fields.geo_point_2d));





    var curWay = OSMVT.ways[closestSegment.wayId];
    //2 go forward :
    var previousPoint = curWay.nodes[closestSegment.wayIdx1];
    var nextPoint = curWay.nodes[closestSegment.wayIdx2];

    var portion = 0;
    var d = 0;
        // compute distance between point (projection of) and n+1
    portion = G.distanceOfProjectedPoint(nextPoint, previousPoint, ataset.fields.geo_point_2d);

    if (d + portion >= length / 2) {
        // if segment too long, take end (/start) point as on the segment, at remaining distance from previous point.

        var endPoint = G.pointOfTheLine(nextPoint, previousPoint, length / 2 - portion);
        // exit this part ! with end point 'endPoint'

    }

// WHIlE §?
    //else
    d += portion;

    var wayIdx = closestSegment.wayIdx2;
    // while distance from centerPoint (d) < length / 2

    // if remaining < 0,5m, abort
    if (d > length + 0.5) {
        //exit with end point 'nextPoint'
        ;
    }

    if (curWay.nodes.length > wayIdx) {
    // add next segment of way -if exist
        wayIdx++;
        previousPoint = nextPoint;
        nextPoint = curWay.nodes[wayIdx];

        portion = G.approxTwoPointsDistance(previousPoint, nextPoint);

        // Go to addif
    } else {
        // find next segment of the street (a way with the same point at end)



    }

                // follow this new way (forward or reverse, if point was first or last)
    }

    }




};

// For each entity
var transform = function(dataset) {
    // get ways with same name
    var name = dataset.fields.typvoie + ' ' + dataset.fields.nomvoie;
    name = name.toLowerCase();

    var ways = waysByName[name];
    if (!ways) { return; }
    console.log(name + ' ' + ways.length);


    // if (dataset.fields.geo_shape && dataset.fields.geo_shape.type != 'Point') {

    //     console.log(name)
    //     console.log(JSON.stringify(dataset.fields.geo_shape, null, 2));
    // }
    if (dataset.fields.geo_point_2d) {
        var closestSegment = OSMVT.closestWay(ways, G.latLon2Point(dataset.fields.geo_point_2d));

        console.log(JSON.stringify(closestSegment, null, 2));
    }
}


// var stream = fs.createReadStream("/home/jacquarg/workspace/Garofacile/rawdata/osm_extract_paul_bert_around.json")
//   .pipe(JSONStream.parse('elements.*'));
  // .pipe(es.mapSync(function (data) {
  //   console.error(data)
  //   return data




// - find ways list with same name from index (z case, ... ?)
// - • trouver la way la plus proche du point.
// • projection du point sur la way
// • (idem autre extrémitée)
// • Si les ways différentes, couper la parkingLane .
// créer résultat :
// {
//         "wayId": 23897404,
//         "type": "ParkingLane",
//         "parking:lane:both": "inline",
//         "start": {
//             "type": "Point",
//             "lat": 48.8730454,
//             "lon": 2.3235788,
//         },
//         "end": {
//             "type": "Point",
//             "lat": 48.8732184,
//             "lon": 2.3224213,
//         },
//     },

// Read File
var stream = fs.createReadStream("/home/jacquarg/workspace/Garofacile/rawdata/stationnement-voie-publique-emplacements.json")
  .pipe(JSONStream.parse('*'));
stream.on('data', transform);

