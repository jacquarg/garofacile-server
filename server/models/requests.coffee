# See documentation on https://github.com/cozy/cozy-db

cozydb = require 'cozydb'

module.exports =
    ro  adinfo:
        # shortcut for emit doc._id, doc
        all: cozydb.defaultRequests.all

        byLastMod: (doc) ->
            emit doc.cea__info?.lastMod, doc
