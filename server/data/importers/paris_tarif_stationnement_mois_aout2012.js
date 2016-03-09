    enrichParkingLane: function(cb) {
        // Add parlane on each street
        // filter and serialize parklane streets.
        console.log("step-1");

        var osmData = require('data/mock_osm_paris');

        // var stationnement = require('data/stationnement_mois');
        var stationnement = require('data/stationnement_mois_aout');
        console.log("step0");
        var byName = {};
        stationnement.forEach(function(item) {
            var row = item.fields;
            var name = row.designation + ' ' + row.denomination
            name = name.toLowerCase();
            var side = null;
            switch(row["cote_du_stationnement"].toLowerCase()) {
                case '-':
                case 'terre-plein':
                case 'contre allée':
                case 'contre allée pair':
                case 'pair et impair (sauf contre allée)':
                // case '':
                case 'pair et impair' : side = 'both'; break;
                case 'pair': side = 'right'; break;
                case 'impair': side = 'left'; break;
                default:
                    console.log(row["cote_du_stationnement"]);
                    break;

            };

            byName[name] = side;

            // };cote_du_stationnement": "-"
            // "parking:lane:right": "inline"

        });

        console.log("step1");

        // Prepares nodes.
        var nodes = {};

        var keepN = {};
        var keepW = [];

        osmData.elements.forEach(function(elem) {
        // Nodes come first in the file.
        if (elem.type === 'node') {
            console.log("node: " + elem.id);
            nodes[elem.id] = elem;
        }

        if (elem.type === "way") {
            if (elem.tags.name && elem.tags.name.toLowerCase() in byName) {
                elem.tags['parking:lane:' + byName[elem.tags.name.toLowerCase()]] = 'inline';

                // keep way and its nodes.
                keepW.push(elem);
                for (var i = 0; i<elem.nodes.length; i++) {
                    var id = elem.nodes[i];
                    keepN[id] = nodes[id];
                }
            }
        }
        console.log("step2");

        });
        var keep = Object.keys(keepN).map(function(id) { return keepN[id]; });
        osmData.elements = keep.concat(keepW);

        // console.log(JSON.stringify(osmData));
        cb(null, osmData);
    },
