/*jslint node: true*/

"use strict";

var restify = require('restify');
var util = require('util');
var config = require('./config.js');



var server = restify.createServer();
server.use(restify.bodyParser());

server.listen(config.listeningPort, function () {
    console.info('Server listening on port %d', config.listeningPort);
});

module.exports.server = server;

require('./routes.js');

// update host list regularly
require('./update-hosts.js');
