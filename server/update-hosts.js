/*jslint node: true*/

"use strict";

var schedule = require('node-schedule');
var arpscan = require('arpscan');
var config = require('./config.js');
var services = require('./services.js');
var model = require('./model.js');



function onArpscanDone(err, scannedHosts) {
    if(err) throw err;
    console.log('newly scanned hosts= %s' + JSON.stringify(scannedHosts));

    var hwaddrList = [];

    // build the list of scanned hardware addresses
    for (var i = 0; i < scannedHosts.length; i++) {
        var scannedHost = scannedHosts[i];
        hwaddrList.push(scannedHost.mac.trim().toUpperCase());
    }

    services.findHosts(hwaddrList).then(function (knownHosts) {
        var hostsToAdd = [];

        scannedHostsLoop:
        for (var i = 0; i < scannedHosts.length; i++) {
            var scannedHost = scannedHosts[i];

            for (var j = 0; j < knownHosts.length; j++) {
                var knownHost = knownHosts[j];

                // if the scanned host is known
                if (scannedHost.mac.trim().toUpperCase() === knownHost.hwaddr.trim().toUpperCase()) {
                    // delete this known host as it won't be necessary to check whether it exists
                    knownHosts.splice(j, 1);
                    // break the know hosts loop
                    continue scannedHostsLoop;
                }
            }

            // add the host to the list of the new hosts to save
            hostsToAdd.push(new model.Host(scannedHost.mac, scannedHost.vendor));
        }

        // save the new hosts
        services.addHosts(hostsToAdd);
    }).catch(function (error) {
        console.error('An error occurred saving hosts in database: %s', error);
    });
}

var updateHosts = function () {
    console.info('Updating host list');

    var arpscanOpts = {
        interface: config.api.updateHostsInterface,
        sudo: true
    };
    arpscan(onArpscanDone, arpscanOpts);
};

// start the scheduled job
schedule.scheduleJob(config.api.cronUpdateHosts, updateHosts);
