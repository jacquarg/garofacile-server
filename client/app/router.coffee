application = require 'application'
HomeView = require 'views/home'

module.exports = class Router extends Backbone.Router

    routes:
        '': 'home'

    home: ->
        homeView = new HomeView()
        application.layout.content.show homeView
