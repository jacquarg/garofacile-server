# See documentation on https://github.com/frankrousseau/americano#routes

index = require './index'
parklanes = require './parklanes'

module.exports =
    'foo':
        get: index.main
    'parklanes/around':
        get: parklanes.around

