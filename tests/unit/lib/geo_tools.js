should = require('chai').should();

G = require('../../../server/lib/geo_tools');


module.exports = describe('Geo map', function() {
  var a = { lon: 2, lat: 1.5 };
  var b = { lon: 5.5, lat: 3 };
  var c = { lon: 2.5, lat: 4.5 };
  var d = { lon: 3.75, lat: 2.25 }; // milieu de [AB]
  var x = { lon: 1, lat: 0};
  var y = { lon: 0, lat: 1};

  var ab = { lon: b.lon - a.lon, lat: b.lat - a.lat };
  var ac = { lon: c.lon - a.lon, lat: c.lat - a.lat };

  describe('approxTwoPointsDistance', function() {

    it('is symetric', function() {
        G.approxTwoPointsDistance(a, b).should.equal(
            G.approxTwoPointsDistance(b, a));

    });
    it('is accurate', function() {
        G.approxTwoPointsDistance(a, b).should.closeTo(380788, 1);
        G.approxTwoPointsDistance(a, c).should.closeTo(304138, 1);
        G.approxTwoPointsDistance(b, c).should.closeTo(335410, 1);
    });
  });

  describe('scalarProduct', function() {
    it('null ortogonals', function() {
        G.scalarProduct(x, y).should.equal(0);
    });
    it('multiplicate collinears', function() {
        G.scalarProduct(x, { lon: 7, lat: 0}).should.equal(70000000000);
        G.scalarProduct(ab, { lon: 7, lat: 3}).should.equal(290000000000);
    });

    it('is symetric', function() {
        G.scalarProduct(ab, ac).should.closeTo(
            G.scalarProduct(ac, ab), 1);
    });


  });

  describe('distanceOfProjectedPoint', function() {
    it('work if point is on the line', function() {
        G.distanceOfProjectedPoint(a, b, d).should.closeTo(
            G.approxTwoPointsDistance(a, b) / 2, 1);
    });

    it('work with trivials', function() {
        G.distanceOfProjectedPoint(x, {lon: 10, lat: 0}, a).should.closeTo(100000, 1);
    });

    it('is accurate', function() {
        G.distanceOfProjectedPoint(a, b, c).should.closeTo(164133, 1);
    })


    it('isnt oriented', function() {
        G.distanceOfProjectedPoint({lon: 3, lat: 0}, x, a).should.closeTo(100000, 1);

    })
  });

  describe('point of the line', function() {
    it('is accurate', function() {
      var m = G.pointOfTheLine(a, b, 190394);
      m.lat.should.closeTo(d.lat, 0.0001);
      m.lon.should.closeTo(d.lon, 0.0001);
    });
  });



});
