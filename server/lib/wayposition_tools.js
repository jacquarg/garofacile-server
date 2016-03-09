// singleton.
var that = {};
module.exports = that;
that.ways = {};
that.nodes = {};
that.bboxCenters = [];

that.rnPosition = null; //osmRoadNetworkPosition
that.gpsPosition = null;

//?that.routePosition = null;
that.wayPortions = null; // Current route.

that.positionUpdateListeners = [];

////////////////////////////////////////////////////////
// Exported methods
////////////////////////////////////////////////////////


module.exports.subscribePosition = function(l) {
    //TODO threads ? lib ? ...
    that.positionUpdateListeners.push(l);
};
module.exports.unsubscribePosition = function(l) {
    var index = array.indexOf(l);
    that.positionUpdateListeners.splice(index, 1);
};

module.exports.updatePosition = that.updatePosition = function(gpsPoint, cb) {
    var KEEPWAY_MAX_DIST = 0.0010; // 10M. ? 100M?
    var setDirectionNNewPoint = function(cs) {
        if (that.rnPosition) {
            that.setDirection(cs);
        }

        that.rnPosition = cs;
        if (cb != undefined) {
            cb(that.rnPosition);
        }
        that.positionUpdateListeners.forEach(function(l) { l(cs); });
    }

    that.getVectorData(gpsPoint, function() {

    if (that.rnPosition) {
        // search on the route first.
        var cs = that.closestSegmentInWay(that.ways[that.rnPosition.cea__osmWayId], gpsPoint, { dist : Number.MAX_VALUE });

        if (cs.dist < KEEPWAY_MAX_DIST) {
            // less than 10m, same road.
            setDirectionNNewPoint(cs);
            return;
        } // else
      } // else
        var cs = that.closestSegment(gpsPoint, setDirectionNNewPoint);
//    }

    //console.log(new Date().getMilliseconds() - start);

     });
};

/**
 *  Identify the look ahead RoadNetworkWayPortion,
 */
module.exports.forePortion = that.forePortion = function(cardata) {
    // look ahead distance ?
    // events about 10s before event (between 10s and 15s).
    var fw = cardata.cea__osmRoadNetworkPosition.cea__wayForward;
    var speed = cardata.cea__instantSpeed;
    var dm = speed * 10 / 3.6 ; // d : meters.
    var dM = speed * 20 / 3.6 ; // d : meters.

    // --> which segment of the way (indexes range) ?
    var way = that.ways[cardata.cea__osmRoadNetworkPosition.cea__osmWayId];

    // go ahead on the way.
    var prevI = null;
    var i = null;
    var next = null
    if (fw) {
        prevI = cardata.cea__osmRoadNetworkPosition.cea__wayIdx1;
        i = cardata.cea__osmRoadNetworkPosition.cea__wayIdx2;
        next = function(i) { return i + 1 ; };

    } else {
        prevI = cardata.cea__osmRoadNetworkPosition.cea__wayIdx2;
        i = cardata.cea__osmRoadNetworkPosition.cea__wayIdx1;
        next = function(i) { return i - 1 ; };
    }

    var prevLatLon = [
        cardata.cea__gpsCurrent.wgs84__lat,
        cardata.cea__gpsCurrent.wgs84__lon
    ];
    var dist = 0;

    var startIdx = -1;
    var endIdx = -1;

    var inBoxPoints = [];
    var loop = true;
    while(loop) {
        var curLatLon = [ way.nodes[i].lat, way.nodes[i].lon ];
        //console.log(prevLatLon);
        //console.log(curLatLon);

        dist += that.approxTwoPointsDistance(prevLatLon, curLatLon);
        //console.log(dist);
        if (dist >= dm && startIdx == -1) {
            startIdx = prevI;
            inBoxPoints.push(prevLatLon);
        }
        if (startIdx != -1) {
            inBoxPoints.push(curLatLon);
        }

        if (dist >= dM) {
            endIdx = i;
            loop = false;
        } else {
            prevLatLon = curLatLon;
            prevI = i;
            i = next(i);
            if (i < 0 || i >= way.nodes.length) {
                // todo startIdx !?
                endIdx = i;
                loop = false;
            }
        }

    }

// TODO : out of way ??


//    TODO: create a valid boundig ways.

    var boundingWays = [
      {
        "rdf__type": "cea__RoadNetworkWayPortion",
        "cea__osmWayId": cardata.cea__osmRoadNetworkPosition.cea__osmWayId,
        "cea__wayIdx1": fw ? startIdx : endIdx, // TODO
        "cea__wayIdx2": fw ? endIdx : startIdx, // TODO
        "cea__wayForward": fw,
       },
      ];

   return boundingWays;
};

module.exports.getBBOXAroundPortion = function(boundingWays) {
      // bbox which contains each node of the bboudingWays
    //[minLat, minLon, maxLat, maxLon];
    var bbox = boundingWays.reduce(function(bbox, latLon) {
        bbox[0] = Math.min(bbox[0], latLon[0]);
        bbox[1] = Math.min(bbox[1], latLon[1]);
        bbox[2] = Math.max(bbox[2], latLon[0]);
        bbox[3] = Math.max(bbox[3], latLon[1]);
        return bbox;
        }, [Number.MAX_VALUE, Number.MAX_VALUE, Number.MIN_VALUE, Number.MIN_VALUE]);
    return bbox;
};
//////////////////////// ####################



module.exports.lonLatsToWayPositions = that.lonLatsToWayPositions = function(lonLat_S, cb) {
    async.eachSeries(lonLat_S, function(lonLat, itCb) {
        //console.log(lonLat);
        that.getVectorData({
            "rdf__type": "wgs84__Point",
            "wgs84__lon": lonLat[0],
            "wgs84__lat": lonLat[1]
        }, itCb);
    }, function(err) {
//    function(lonLat_S, cb) {

    var curLonLat = lonLat_S[2];
    var prevLonLat = lonLat_S[1];
    var portion = that.newPortion(curLonLat, prevLonLat);
    var portions = [];
    portions.push(portion);

    // Look on the way (Z no direction ...).
    var prevLonLat = curLonLat;
    for (i=3; i < lonLat_S.length - 1; i++) {
        curLonLat = lonLat_S[i];

        //console.log("point: " + i + ", lonlat: " + curLonLat);

        var nextIdx = null;
        if (portion.cea__wayForward) {
            nextIdx = portion.cea__wayIdx2 + 1;
        } else {
            nextIdx = portion.cea__wayIdx1 - 1;
        }
        //

        // Stay on way ?
        var way = that.ways[portion.cea__osmWayId];
        if (nextIdx >= 0 && nextIdx < way.nodes.length
                && that.isSamePoint(curLonLat, way.nodes[nextIdx])) {
            portion["cea__wayIdx" + (portion.cea__wayForward ? "2" : "1")] = nextIdx;

        // change way !
        } else {
            portion = that.newPortion(curLonLat, prevLonLat);

                // skip those segment.
            while(portion == null) {
                console.log("skip : " + i + " : lonLat" + curLonLat);
                i++;
                curLonLat = lonLat_S[i];
                prevLonLat = lonLat_S[i-1];
                portion = that.newPortion(curLonLat, prevLonLat);
            }

            portions.push(portion);
        }
        prevLonLat = curLonLat;
    }

    cb(portions); // TODO in routingdemo ...
    });
};


module.exports.closestSegment = that.closestSegment = function(wgs84__Point, cb) {

    that.getVectorData(wgs84__Point, function() {

  //{
  //  "rdf__type": "cea__RoadNetworkWayPortion",
  //  "cea__osmWayId": "23204955",
  //  "cea__wayIdx1": 17,
  //  "cea__wayIdx2": 18,
  //  "cea__wayForward": true,
  //},
    var closestSegment = {
        dist : Number.MAX_VALUE
    };
    for (var wayId in that.ways) {
        var way = that.ways[wayId];
        //console.log(way.tags.name);
        var length = way.nodes.length;
        closestSegment = that.closestSegmentInWay(way, wgs84__Point, closestSegment);

    }

    //return closestSegment;
    cb(closestSegment);
    });
};


////////////////////////////////////////////////////////
// Local methods
////////////////////////////////////////////////////////

/**
 * Get data ~50 around (0.005°) around the point from OSM.
 * if needed.
 */

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

that.newPortion = function(curLonLat, prevLonLat) {
    // Find the way which contains prevLonLat and curLonLat.
    for (var wayId in that.ways) {
        var way = that.ways[wayId];
        //console.log(way);

        var curIdx = -1;
        for (var i=0; i<way.nodes.length; i++) {
            if (that.isSamePoint(curLonLat, way.nodes[i])) {
                curIdx = i;
                break;
            }
        }
//        var curIdx = way.nodes.findIndex(function(node, idx) {
//            return that.isSamePoint(curLonLat, node);
//        });
        if (curIdx == -1) {
            continue;
        }

        //console.log(curIdx);
        //console.log(way);

        if (curIdx >= 1 && that.isSamePoint(prevLonLat, way.nodes[curIdx - 1])) {
            portion = {
                    "rdf__type": "cea__RoadNetworkWayPortion",
                    "cea__osmWayId": wayId,
                    "cea__wayIdx1": curIdx - 1,
                    "cea__wayIdx2": curIdx,
                    "cea__wayForward": true,
            };
            return portion;

        } else if (curIdx + 1 < way.nodes.length && that.isSamePoint(prevLonLat, way.nodes[curIdx + 1])) {
            portion = {
                    "rdf__type": "cea__RoadNetworkWayPortion",
                    "cea__osmWayId": wayId,
                    "cea__wayIdx1": curIdx,
                    "cea__wayIdx2": curIdx + 1,
                    "cea__wayForward": false,
            };
            return portion;

        } //else {
            // not the good way ...
            // loop.
        //}
    }
    console.log("can't find the way !!");
    return null;
};


that.closestSegmentInWay = function(way, wgs84__Point, closestSegment) {
        var length = way.nodes.length;
        return way.nodes.reduce(function(min, elem, index, nodes) {
            if (index <  length - 1) {
                var elem2 = nodes[index + 1];
                // distance entre segment et le point.
                //var dist = dotLineLength(
                var dist = that.pDistance(
                wgs84__Point.wgs84__lat, wgs84__Point.wgs84__lon,
                elem.lat, elem.lon,
                elem2.lat, elem2.lon);

                //console.log(dist);
                if (dist < min.dist) {
                    return {
                        "rdf__type": "cea__RoadNetworkWayPortion",
                        "cea__osmWayId": way.id,
                        "cea__wayIdx1": index,
                        "cea__wayIdx2": index + 1,
                        "dist": dist
                        //"cea__wayForward": true,
                    };
                }
            }

            return min;

        }, closestSegment);
};


/**
* Return index of intersect point in cur.way.
* or -1 if none found.
*/
that.findIntersectionIdx = function(prev, cur) {
    // look for an (hypothetic) intersection between the two ways.

    var pWay = that.ways[prev.cea__osmWayId];
    var cWay = that.ways[cur.cea__osmWayId];

    for (var i=0; i<pWay.nodes.length; i++) {
        if (prev.cea__wayForward) {
            var j = (i + prev.cea__wayIdx1) % pWay.nodes.length;
        } else {
            var j = (prev.idx2 - i + pWay.nodes.length) % pWay.nodes.length;

        }

//        console.log(pWay.nodes);
//        console.log(j);
        var prevNode = pWay.nodes[j];
//        console.log(prevNode);
        var idx = -1;
        for (var k=0; k<cWay.nodes.length ; k++) {
            var node = cWay.nodes[k];
        //var idx = cur.way.nodes.findIndex(function(node, idx) {
            //if (prevNode.id == node.id) { //prevNode === node should work too.
            if (prevNode === node) { //prevNode === node should work too.
                idx = k;
                break;
            }
        }

        if (idx != -1) {
            return idx;
        }
    }
    return -1;

};

that.setDirection = function(newRNPosition) {
    var cur = newRNPosition;
    var prev = that.rnPosition ;

    if (cur.cea__osmWayId == prev.cea__osmWayId) {
        // same way.
        if (prev.cea__wayIdx1 < cur.cea__wayIdx1) {
            cur.cea__wayForward = true;
        } else if (prev.cea__wayIdx1 > cur.cea__wayIdx1) {
            cur.cea__wayForward = false;
        } else {
            cur.cea__wayForward = prev.cea__wayForward ;
        }

    } else { // prev.way != cur.way
        var idx0 = that.findIntersectionIdx(prev, cur);
        if (idx0 != -1) {
            cur.cea__wayForward = (idx0 <= cur.cea__wayIdx1) ;
        }
    }

    // fill up previous points ?? (on same way ; depends on sending buffer).
};


//////////////////////////////////////////////////////
// Tools
//////////////////////////////////////////////////////


that.isSamePoint = function(lonLat, node) {
    var dist = 0.00001; // ~1m
    if (node == undefined) {
        console.log(lonLat);
        return false;
    }
    return (Math.abs(node.lon - lonLat[0]) < dist && Math.abs(node.lat - lonLat[1]) < dist);

};

that.approxTwoPointsDistance = function(latLon1, latLon2) {
    // Meters, at france Latitude, so with 0,01° (Lon) * 0,01° (Lat) <-> 0,8km * 1,1km
    var dLat = latLon1[0] - latLon2[0];
    var dLon = latLon1[1] - latLon2[1];
    return Math.sqrt(dLat * dLat + dLon * dLon ) * 100000 ;
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
