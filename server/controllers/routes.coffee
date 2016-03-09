# See documentation on https://github.com/frankrousseau/americano#routes

index = require './index'
parklanes = require './parklanes'
roadinfos = require './roadinfos'

module.exports =
    'foo':
        get: index.main
    'public/parklanes/around':
        get: parklanes.around

    'public/roadinfos/':
        get: roadinfos.relevants
        post: roadinfos.post

