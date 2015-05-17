module.exports = class HomeView extends Backbone.Marionette.ItemView
    id: 'home-view'
    template: require './templates/home'

    # Called when this View becomes a child of document.
    # http://marionettejs.com/docs/v2.4.1/marionette.view.html#view-attach--onattach-event
    onAttach: ->
        console.log "View is now attached to the document, do something :)"


    # Called when this view has been rendered and displayed.
    # http://marionettejs.com/docs/v2.4.1/marionette.view.html#view-onshow
    onShow: ->
        console.log "View shown, time to add children, an so on !"


