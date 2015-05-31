/*jslint node: true, regexp: true, unparam: true*/

"use strict";

var restify = require('restify');
var hostController = require('./controller.js');
var server = module.parent.exports.server;
var config = require('./config.js');



/**
 * Redirect URL '/' to '/client'
 */
server.get('/', function (req, res, next) {
    res.header('Location', '/' + config.client.urlPrefix);
    res.send(302, '');
});

/**
 * Serve static resources for client side. Client is reachable with
 * {@link http://hostname:port/client}
 */
server.get(/\/client\/?.*/, restify.serveStatic({
    directory: './static',
    default: 'index.html'
}));

server.get('/' + config.api.urlPrefix + 'hosts', hostController.listHosts);
server.post('/' + config.api.urlPrefix + 'host', hostController.addHost);
server.del('/' + config.api.urlPrefix + 'host/:hostid', hostController.removeHost);
server.post('/' + config.api.urlPrefix + 'wakeup', hostController.wakeupHost);
