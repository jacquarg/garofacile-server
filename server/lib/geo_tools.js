that = {};
module.exports = that;

that.latLon2Point = function(latLon) {
    return { lat: latLon[0], lon: latLon[1] } ; };




that.approxTwoPointsDistance = function(a, b) {
    // Meters, at france Latitude, so with 0,01° (Lon) * 0,01° (Lat) <-> 0,8km * 1,1km
    var dLat = a.lat - b.lat;
    var dLon = a.lon - b.lon;
    return Math.sqrt(dLat * dLat + dLon * dLon ) * 100000 ;
}

// a and b are to vectors.
that.scalarProduct = function(a, b) {
    return (a.lat * b.lat + a.lon * b.lon) * 100000 * 100000;
}

// Put a point on the line
// a is the point of the line, we want the distance
// B : another point of the line
// d : distance from the new point to a.
that.pointOfTheLine = function(a, b, d) {
    var abDist = that.approxTwoPointsDistance(a, b);
    var abVect = {
        lat: b.lat - a.lat,
        lon: b.lon - a.lon
    };
    return {
        lon: a.lon + abVect.lon * d / abDist,
        lat: a.lat + abVect.lat * d / abDist
    }
}


// A is the point of the line, we want to compute teh distance from
// B : another point of the line
// M : the point to project.
that.distanceOfProjectedPoint = function(a, b, m) {
    var abDist = that.approxTwoPointsDistance(a, b);
    var abVect = {
        lat: b.lat - a.lat,
        lon: b.lon - a.lon
    };

    return that.scalarProduct({lon: m.lon - a.lon, lat: m.lat - a.lat}, abVect) / abDist;
}

// from : http://stackoverflow.com/a/6853926/1414450
that.pDistance = function(x, y, x1, y1, x2, y2) {

  var A = x - x1;
  var B = y - y1;
  var C = x2 - x1;
  var D = y2 - y1;

  var dot = A * C + B * D;
  var len_sq = C * C + D * D;
  var param = dot / len_sq;

  var xx, yy;

  if (param < 0 || (x1 == x2 && y1 == y2)) {
    xx = x1;
    yy = y1;
  }
  else if (param > 1) {
    xx = x2;
    yy = y2;
  }
  else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  var dx = x - xx;
  var dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy);
};
