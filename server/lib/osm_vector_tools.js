var BBOX_RADIUS = 0.005 ;

// singleton.
var that = {};
module.exports = that;

that.ways = {};
that.nodes = {};

that.ways2LatLonSegments = function(ways) {
    var segments = [];
    for (var key in ways) {
        segments.push(that.way2LatLons(ways[key]));
    }
    return segments;
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

// TODO
that.getVectorData = function(wgs84__Point, cb) {
    var bboxRadius = 0.005 ;
    //var bboxRadius = 1 ; // TODO Stub !!!

    if (that.bboxCenters.some(function(point) {
            return (Math.abs(point.wgs84__lon - wgs84__Point.wgs84__lon) < bboxRadius
                && Math.abs(point.wgs84__lat - wgs84__Point.wgs84__lat) < bboxRadius);
        })) {
            //console.log("No need data.");
            cb();
            return;
    }

    APIs.getOSMBBOX(wgs84__Point, bboxRadius, function(rawData) {
      that.bboxCenters.push(wgs84__Point);
      rawData.elements.forEach(function(elem) {
        if (elem.type == "node") {
            that.nodes[elem.id] = elem;

        } else if (elem.type == "way") {
            // If a node is missing, skip the way.
            var nodesObjs = [];
            for (var i=0;i<elem.nodes.length;i++) {
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

      cb();
    });
};


that.closestWay = function(ways, point) {
    var segment = ways.reduce(function(closestSegment, way) {
        return that.closestSegmentInWay(way, point, closestSegment);
    }, { dist : Number.MAX_VALUE });

    return segment;
};


that.closestSegmentInWay = function(way, point, closestSegment) {
        var length = way.nodes.length;
        return way.nodes.reduce(function(min, elem, index, nodes) {
            if (index <  length - 1) {
                var elem2 = nodes[index + 1];
                // distance entre segment et le point.
                //var dist = dotLineLength(
                var dist = that.pDistance(
                point.lat, point.lon,
                elem.lat, elem.lon,
                elem2.lat, elem2.lon);

                if (dist < min.dist) {
                    return {
                        "type": "RoadNetworkWayPortion",
                        "wayId": way.id,
                        "wayIdx1": index,
                        "wayIdx2": index + 1,
                        "dist": dist
                    };
                }
            }

            return min;

        }, closestSegment);
};

that.nextWayInStreet = function(street, currentWay, end) {
    return street.filter(function(way) {
        if (way === currentWay) { return false; }
        return way.nodes[0] === end ||
            way.nodes[nodes.length - 1]  === end;
    })
};

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
