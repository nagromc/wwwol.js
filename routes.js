/*jslint node: true, regexp: true, unparam: true*/

"use strict";

var restify = require('restify');
var hostController = require('./controller.js');
var server = module.parent.exports.server;

var API_PREFIX = 'api/';

/**
 * Redirect URL '/' to '/client'
 */
server.get('/', function (req, res, next) {
    res.header('Location', '/client');
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

server.get('/' + API_PREFIX + 'hosts', hostController.list);
server.post('/' + API_PREFIX + 'host', hostController.add);
server.del('/' + API_PREFIX + 'host/:hostid', hostController.remove);
server.post('/' + API_PREFIX + 'wakeup', hostController.wakeup);

