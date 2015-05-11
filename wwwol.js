/*jslint node: true, regexp: true, unparam: true, plusplus: true*/

"use strict";

var restify = require('restify');
var util = require('util');
var Datastore = require('nedb');
var wol = require('wake_on_lan');



var API_PREFIX = 'api/';
var LISTENING_PORT = 8080;
var DB_PATH = './hosts.db';

var db = new Datastore({ filename: DB_PATH, autoload: true });

/**
 * A host is represented by a hardware address and a name.
 * @class
 */
var Host = function (id, hwaddr, name) {
    this.id = id;
    this.hwaddr = hwaddr;
    this.name = name;
};

// for test purposes
var host1 = new Host(1, "00:11:22:aa:bb:cc", "host1.local"),
    host2 = new Host(2, "11:22:33:bb:cc:dd", "host2.local"),
    host3 = new Host(3, "22:33:44:cc:dd:ee", "host3.local");
db.insert([host1, host2, host3]);



var server = restify.createServer();

server.use(restify.bodyParser());

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
    db.find({}, function (err, docs) {
        var hosts = docs;

        res.json(hosts);
        next();
    });
});

/**
 * Wake up a host.
 * @param {number} host's id
 * @returns {boolean} true if the magic packet has been sent successfully. False
 * otherwise.
 */
server.post('/' + API_PREFIX + 'wakeup', function (req, res, next) {
    var hostid = parseInt(req.params.hostid, 10);
    console.log(util.format('wakeup(hostid=%s)', hostid));

    db.findOne({id: hostid}, function (err, docs) {
        var response = {"response": false};

        wol.wake(docs.hwaddr, {}, function(error) {
            if (error) {
                console.error(util.format('Could not switch on host [%s].', docs.hwaddr));
            } else {
                console.log(util.format('Host [%s] has been switched on.', docs.hwaddr));
                response = {"response": true};
            }

            res.json(response);
            next();
        });
    });
});
