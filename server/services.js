/*jslint node: true*/

"use strict";

var util = require('util');
var wol = require('wake_on_lan');
var isMac = require('is-mac');
var db = require('./db.js');
var model = require('./model.js');



/**
 * Promise to find added {@link Host}
 * @returns {object} The list of all {@link Host}
 */
exports.findHosts = function () {
    return new Promise(function (resolve, reject) {
        db.find({}, function (error, doc) {
            if (error) {
                return reject('Could not execute find statement: ', error);
            }

            console.log('%d hosts found', doc.length);
            return resolve(doc);
        });
    });
};


/**
 * Promise to save a {@link Host} in database
 * @param {string} hwaddr - the host's hardware address
 * @param {string} name - the host name
 * @returns {object} the {@link Host} if it has been added to database
 */
exports.addHost = function (hwaddr, name) {
    return new Promise(function (resolve, reject) {
        if (!isMac(hwaddr)) {
            return reject(util.format('The given hardware address ("%s") is not a valid MAC address.', hwaddr));
        }

        var hostToAdd = new model.Host(hwaddr, name);

        db.insert([hostToAdd], function (err, docs) {
            if (err) {
                return reject(util.format('Could not add new host [%s].', JSON.stringify(hostToAdd)));
            }

            console.info('Host [%s] has been added.', JSON.stringify(hostToAdd));
            return resolve(hostToAdd);
        });
    });
};

/**
 * Promise to update a {@link Host} in database
 * @param {string} hostid - host's id
 * @param {string} hostname - the new host name
 * @returns {object} the {@link Host} if it has been added to database
 */
exports.updateHost = function (hostid, hostname) {
    return new Promise(function (resolve, reject) {
        db.update({_id: hostid}, { $set: {name: hostname} }, {}, function (err, numReplaced) {
            if (err) {
                return reject(util.format('Could not update host [%s].', hostid));
            }

            console.info('Host [%s] has the new name [%s].', hostid, hostname);
            return resolve(true);
        });
    });
};

/**
 * Promise to remove a {@link Host} from database
 * @param {string} hwaddr - the host's hardware address
 * @returns {boolean} true if the {@link Host} has been removed
 */
exports.removeHost = function (hostid) {
    return new Promise(function (resolve, reject) {
        db.remove({'_id': hostid}, {}, function (err, numRemoved) {
            if (err) {
                return reject(util.format('Could not remove host [%s]', hostid));
            }

            console.info('Host [%s] has been removed', hostid);
            return resolve(true);
        });
    });
};

/**
 * Promise to find a hardware address into database
 * @param {string} The host's id
 * @returns {string} The hardware address found
 * @throws Will reject the pormise if the host has not been found or if an error
 * occurs
 */
exports.findHwaddr = function (hostid) {
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

/**
 * Promise to wake up a host
 * @param {string} The host to wake up
 * @returns {string} The switched on host's hardware address
 * @throws Will reject the pormise if the host could not be switched on
 */
exports.wakeupHost = function (hwaddr) {
    return new Promise(function (resolve, reject) {
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
