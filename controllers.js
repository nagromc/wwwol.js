/*jslint node: true, unparam: true*/

"use strict";

var util = require('util');
var services = require('./services.js');
// TODO db should be in services.js
var db = require('./db.js');



/**
 * Send a message to the client in case of error by the caller.
 */
var handleError = function (error, res) {
    var message = 'Server internal error: ' + error;
    console.error(message);
    res.json(500, {error: message});
};

/**
 * List the available hosts.
 *
 * @returns {Array} List of {@link Host}.
 */
exports.listHosts = function (req, res, next) {
    console.log('listHosts()');

    db.find({}, function (err, docs) {
        var hosts = docs;

        res.json(hosts);
        next();
    });
};

/**
 * Add a {@link Host} into database.
 * @param {string} host's hardware address
 * @returns {boolean} true if the {@link Host} has been added successfully.
 * False otherwise.
 */
exports.addHost = function (req, res, next) {
    var hwaddr = req.params.hwaddr,
        hostname = req.params.hostname,
        response = {"response": false},
        hostToAdd = new Host(hwaddr, hostname);

    console.log('addHost(hwaddr=[%s];hostname=[%s])', hwaddr, hostname);

    if (!isMac(hwaddr)) {
        throw new Error(util.format('The given hardware address ("%s") is not a valid MAC address.', hwaddr));
    }

    db.insert([hostToAdd], function (err, docs) {
        if (err) {
            console.error('Could not add new host [%s].', JSON.stringify(hostToAdd));
        } else {
            console.info('Host [%s] has been added.', JSON.stringify(hostToAdd));
            response = {"response": true};
        }

        res.json(response);
        next();
    });
};

/**
 * Remove a host from database.
 * @param {string} host's id
 * @returns {boolean} true if the {@link Host} has been removed successfully.
 * False otherwise.
 */
exports.removeHost = function (req, res, next) {
    var hostid = req.params.hostid;
    console.log('removeHost(hostid=[%s])', hostid);

    db.remove({'_id': hostid}, {}, function (err, numRemoved) {
        var response = {"response": false};

        if (err) {
            console.error('Could not remove host [%s]', hostid);
        } else {
            console.info('Host [%s] has been removed', hostid);
            response = {"response": true};
        }

        res.json(response);
        next();
    });
};

/**
 * Wake up a host.
 * @param {string} host's id
 * @returns {boolean} true if the magic packet has been sent successfully.
 */
exports.wakeupHost = function (req, res, next) {
    var hostid = req.params.hostid;
    console.log('wakeupHost(hostid=[%s])', hostid);

    var sendResponse = function (hwaddr) {
        return new Promise(function (resolve, reject) {
            console.log('Sending response of wakeup to client');
            res.json(true);
            next();
        });
    };

    services.findHwaddr(hostid).then(services.wakeupHost).then(sendResponse).catch(function (error) {
        handleError(error, res);
    });
};
