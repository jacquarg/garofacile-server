RoadInfo = require '../models/roadinfo'

module.exports.relevants = (req, res) ->
    RoadInfo.relevant (err, roadInfos) ->
        if err
            res.send 500, message: err
        else
            res.send 200, roadInfos

module.exports.post = (req, res) ->
    RoadInfo.create req.body, (err, roadInfo) ->
            if err
                res.send 500, message: err
            else
                res.send 200, roadInfo
