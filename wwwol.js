/*jslint node: true, regexp: true, unparam: true*/

"use strict";

var restify = require('restify');
var util = require('util');



var API_PREFIX = 'api/';
var LISTENING_PORT = 8080;

/**
 * A host is represented by a hardware address and a name.
 * @class
 */
var Host = function (id, hwaddr, name) {
    this.id = id;
    this.hwaddr = hwaddr;
    this.name = name;
};



var server = restify.createServer();

server.listen(LISTENING_PORT, function () {
    console.log(util.format('Server listening on port %d', LISTENING_PORT));
});

/**
 * Serve static resources for client side. Mapped on
 * {@link http://hostname:port/client}
 */
server.get(/\/client\/?.*/, restify.serveStatic({
    directory: './static',
    default: 'index.html'
}));

/**
 * List the hosts available.
 *
 * @returns {Array} List of {@Host}.
 */
server.get('/' + API_PREFIX + 'hosts', function (req, res, next) {
    var host1 = new Host(1, "00:11:22:aa:bb:cc", "host1.local"),
        host2 = new Host(2, "11:22:33:bb:cc:dd", "host2.local"),
        host3 = new Host(3, "22:33:44:cc:dd:ee", "host3.local");
    res.json([host1, host2, host3]);
    next();
});
