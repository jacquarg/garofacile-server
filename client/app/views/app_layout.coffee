application = require 'application'

module.exports = class AppLayout extends Backbone.Marionette.LayoutView
	template: require './templates/app_layout'
	el: "body"

	regions:
		content: "#content"
