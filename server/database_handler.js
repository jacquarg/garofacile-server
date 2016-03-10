var PouchDB = require ('pouchdb');

PouchDB.plugin(require('geopouch'));
PouchDB.plugin(require('pouchdb-upsert'));


var db;

module.exports.initDB = initDB = function() {
  module.exports.db = db = new PouchDB('db');


  var ddoc = {
    _id: '_design/parkinglane',
    spatial: {
      byGeometry: function (doc) { emit(doc.geometry); }.toString(),
      byPoint: function (doc) { emit(doc.point); }.toString(),
    }
  };

  // save it
  db.putIfNotExists(ddoc).then(function () {
    // success!
    console.log('view updated');
  }).catch(function (err) {
    // some error (maybe a 409, because it already exists?)
    // todo 409 !
      console.log(err);
  });
};

module.exports.resetDB = function() {
  return db.destroy().then(initDB);

};

initDB();

