var OSMVT = require('../../lib/osm_vector_tools');
var JSONStream = require('JSONStream');
var fs = require("fs");
var G = require('../../lib/geo_tools');





// Extract stationment area, with polygones.
// Model
/*{
  "polygon": [
    [
      [
        2.3144458200369207,
        48.842649960462154
      ],
      [
        2.3144245168260418,
        48.84268389017519
      ],
      [
        2.314331633733722,
        48.842829864556634
      ],
    ]
  ],
  "point": [
    48.84295267589161,
    2.3142675896732303
  ],
  "regpar": "Mixte"
}
*/

////////////
//http://codewinds.com/blog/2013-08-20-nodejs-transform-streams.html#creating_object_stream_which_filters_out_data

var stream = require('stream');
var util = require('util');
// node v0.10+ use native Transform, else polyfill
var Transform = stream.Transform || require('readable-stream').Transform;

/*
 * Filters an object stream properties
 *
 * @param filterProps array of props to filter
 */
function Filter(filterProps, options) {
  // allow use without new
  if (!(this instanceof Filter)) {
    return new Filter(filterProps, options);
  }

  // init Transform
  if (!options) options = {}; // ensure object
  options.objectMode = true; // forcing object mode
  Transform.call(this, options);
  this.filterProps = filterProps;
}
util.inherits(Filter, Transform);

Filter.prototype._transform = function(obj, enc, callback) {
    var res = filterNPrune(obj);
    if (res) {
        this.push(JSON.stringify(res) + ',');
    }
    callback();
}


// For each entity
var filterNPrune = function(dataset) {
    // if (['2 Roues', 'Livraison', 'GIG-GIC'].indexOf(dataset.fields.regpri) !== -1) {
    //     return;
    // }

    // if (dataset.fields.regpri.indexOf('Payant') !== 0) {
    //     console.log(dataset.fields.regpri);
    //     console.log(dataset.fields.regpar);
    //     // console.log(JSON.stringify(dataset, null, 2));
    //     return;
    // }

    if (dataset.fields.regpri.indexOf('Payant') === 0 &&
        dataset.fields.geo_shape && dataset.fields.geo_shape.type === 'Polygon') {
        var res = {
            polygon: dataset.fields.geo_shape.coordinates,
            point: dataset.fields.geo_point_2d,
            regpar: dataset.fields.regpar,
        };
        return res;
        // console.log(JSON.stringify(res, null, 2));
    }

}



// Read File
var fileStream = fs.createWriteStream('stationement_paris_light.json');

// fileStream.push('[');
var stream = fs.createReadStream("/home/jacquarg/workspace/Garofacile/rawdata/stationnement-voie-publique-emplacements.json")
  .pipe(JSONStream.parse('*'))
  .pipe(new Filter())
  .pipe(fileStream);
  // .pipe(process.stdout);

// stream.end(function() {
//     fileStream.push(']');
// });
// stream.on('data', filterNPrune);

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

