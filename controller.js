/*jslint node: true, unparam: true*/

"use strict";

var util = require('util');
var wol = require('wake_on_lan');
var isMac = require('is-mac');
var db = require('./db.js');

/**
 * A host is represented by a hardware address and a name.
 * @class
 */
var Host = function (hwaddr, name) {
    this.hwaddr = hwaddr;
    this.name = name;
};

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
exports.list = function (req, res, next) {
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
exports.add = function (req, res, next) {
    var hwaddr = req.params.hwaddr,
        hostname = req.params.hostname,
        response = {"response": false},
        hostToAdd = new Host(hwaddr, hostname);

    console.log('addHost(hwaddr=%s;hostname=%s)', hwaddr, hostname);

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
exports.remove = function (req, res, next) {
    var hostid = req.params.hostid;
    console.log('remove(hostid=%s)', hostid);

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
 * @returns {boolean} true if the magic packet has been sent successfully. False
 * otherwise.
 */
exports.wakeup = function (req, res, next) {
    var hostid = req.params.hostid;
    console.log('wakeup(hostid=[%s])', hostid);

    var findHwaddr = function() {
        return new Promise(function (resolve, reject) {
            db.findOne({'_id': hostid}, function (error, doc) {
                if (error) {
                    return reject('Could not execute findOne statement: ', error);
                }
                if (doc === null) {
                    return reject(util.format('Could not find doc with hostid=[%s]', hostid));
                }

                console.log('Host found hwaddr=[%s]', doc.hwaddr);

                return resolve(doc.hwaddr);
            });
        });
    };

    var wakeupHost = function (hwaddr) {
        return new Promise(function (resolve,reject) {
            console.log('Trying to wake up host [%s]', hwaddr);

            wol.wake(hwaddr, function (error) {
                if (error) {
                    return reject(util.format('Could not switch on host [%s].', hwaddr));
                }

                console.info('Host [%s] has been switched on.', hwaddr);
                return resolve(hwaddr);
            });
        });
    };

    var sendResponse = function (hwaddr) {
        return new Promise(function (resolve,reject) {
            console.log('Sending response of wakeup to client');
            res.json(true);
            next();
        });
    };

    findHwaddr().then(wakeupHost).then(sendResponse).catch(function (error) {
        handleError(error, res);
    });
};
