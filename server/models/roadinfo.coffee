# See documentation on https://github.com/aenario/cozydb/

cozydb = require 'cozydb'

module.exports = RoadInfoModel = cozydb.getModel 'RoadInfo',
    #"rdf__type": "cea__RoadInfo",
    rdf__type: String
    #"suri": "cea__019",
    #"cea__info": {
        #"rdf__type": "cea__ParkingFreeSpace",
        #"length": 5.0,
        #"free": true,
        #"price": 2.4,
        #"lastMod": "20150401T18:34:00.000Z",
    #},
    cea_info: Object
    #"cea__infoQuality": 0.8,
    # "cea__gpsPosition" : {
    # "rdf__type": "wgs84__Point",
    # "wgs84__lon": 2.372779,
    # "wgs84__lat": 48.837657,
    # },
    cea__gpsPosition: Object
    # "cea__osmRoadNetworkPosition": {
    #   "rdf__type": "cea__RoadNetworkWayPortion",
    #   "cea__osmWayId": "23109421",
    #   "cea__wayIdx1": 0,
    #   "cea__wayIdx2": 1,
    #   "cea__wayForward": true
    # },


# Return still relevant info.
RoadInfoModel.relevant = (callback) ->
    endKey = moment().add('hour', -1).toISOString()
    RoadInfoModel.request 'byLastMod', {endkey: endKey, descending: true}, \
        callback

