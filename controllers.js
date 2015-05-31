/*jslint node: true, unparam: true*/

"use strict";

var util = require('util');
var services = require('./services.js');
// TODO db should be in services.js
var db = require('./db.js');



/**
 * Send the controller's response to the client
 * @param {object} jsonResponse - a JSON object to send to the client
 * @param {object} res - the HTTP response
 * @param {requestCallback} next
 */
var sendResponse = function (jsonResponse, res, next) {
    console.log('Sending response to client: [%s]', JSON.stringify(jsonResponse));
    res.json(jsonResponse);
    next();
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
exports.listHosts = function (req, res, next) {
    console.log('listHosts()');

    services.findHosts().then(function (hosts) {
        sendResponse(hosts, res, next);
    }).catch(function (error) {
        handleError(error, res);
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
        hostname = req.params.hostname;

    console.log('addHost(hwaddr=[%s];hostname=[%s])', hwaddr, hostname);

    services.addHost(hwaddr, hostname).then(function (result) {
        sendResponse(result.hwaddr, res, next);
    }).catch(function (error) {
        handleError(error, res);
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

    services.removeHost(hostid).then(function (result) {
        sendResponse(result, res, next);
    }).catch(function (error) {
        handleError(error, res);
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

    services.findHwaddr(hostid).then(services.wakeupHost).then(function () {
        sendResponse(true, res, next);
    }).catch(function (error) {
        handleError(error, res);
    });
};
