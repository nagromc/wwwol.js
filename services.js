/*jslint node: true*/

"use strict";

var util = require('util');
var wol = require('wake_on_lan');
var isMac = require('is-mac');
var db = require('./db.js');
var model = require('./model.js');



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
