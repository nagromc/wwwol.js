/*jslint node: true*/

"use strict";

var restify = require('restify');
var util = require('util');

var API_PREFIX = 'api/';
var LISTENING_PORT = 8080;



var server = restify.createServer();
server.use(restify.bodyParser());

server.listen(LISTENING_PORT, function () {
    console.info(util.format('Server listening on port %d', LISTENING_PORT));
});

module.exports.server = server;

require('./routes.js');

