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

    console.log(util.format('addHost(hwaddr=%s;hostname=%s)', hwaddr, hostname));

    if (!isMac(hwaddr)) {
        throw new Error(util.format('The given hardware address ("%s") is not a valid MAC address.', hwaddr));
    }

    db.insert([hostToAdd], function (err, docs) {
        if (err) {
            console.error(util.format('Could not add new host [%s].', JSON.stringify(hostToAdd)));
        } else {
            console.info(util.format('Host [%s] has been added.', JSON.stringify(hostToAdd)));
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
    console.log(util.format('remove(hostid=%s)', hostid));

    db.remove({'_id': hostid}, {}, function (err, numRemoved) {
        var response = {"response": false};

        if (err) {
            console.error(util.format('Could not remove host [%s]', hostid));
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
    console.log(util.format('wakeup(hostid=%s)', hostid));

    db.findOne({'_id': hostid}, function (err, docs) {
        var response = {"response": false};

        wol.wake(docs.hwaddr, {}, function (error) {
            if (error) {
                console.error(util.format('Could not switch on host [%s].', docs.hwaddr));
            } else {
                console.info(util.format('Host [%s] has been switched on.', docs.hwaddr));
                response = {"response": true};
            }

            res.json(response);
            next();
        });
    });
};

