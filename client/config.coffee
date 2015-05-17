exports.config =
    files:
        javascripts:
            joinTo:
                'javascripts/app.js': /^app/
                'javascripts/vendor.js': /^vendor/
            order:
                # Files in `vendor` directories are compiled before other files
                # even if they aren't specified in order.
                before: [
                    'vendor/javascripts/jquery-2.1.1.min.js'
                    'vendor/javascripts/underscore-1.6.0.min.js'
                    'vendor/javascripts/backbone-1.1.2.min.js'
                    'vendor/javascripts/bootstrap-3.1.1.min.js'
                    'vendor/javascripts/backbone.wreqr-1.3.2.js'
                    'vendor/javascripts/backbone.babysitter-0.1.6.js'
                    'vendor/javascripts/backbone.marionette-2.4.1.min.js'
                ]

        stylesheets:
            joinTo: 'stylesheets/app.css'
            order:
                before: []
                after: ['vendor/stylesheets/helpers.css']
        templates:
            defaultExtension: 'jade'
            joinTo: 'javascripts/app.js'
