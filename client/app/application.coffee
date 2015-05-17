class Application extends Backbone.Marionette.Application


    initialize: ->
        @on "start", (options) =>
            AppLayout = require 'views/app_layout'
            @layout = new AppLayout()
            @layout.render()

            # Used in inter-app communication
            #SocketListener = require '../lib/socket_listener'

            # Routing management
            Router = require 'router'
            @router = new Router()

            Backbone.history.start()

            # Makes this object immuable.
            Object.freeze this if typeof Object.freeze is 'function'


module.exports = new Application()
