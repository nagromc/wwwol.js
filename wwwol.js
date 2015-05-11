/*jslint node: true, regexp: true, unparam: true, plusplus: true*/

"use strict";

var restify = require('restify');
var util = require('util');
var Datastore = require('nedb');
var wol = require('wake_on_lan');
var isMac = require('is-mac');



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



var server = restify.createServer();

server.use(restify.bodyParser());

server.listen(LISTENING_PORT, function () {
    console.info(util.format('Server listening on port %d', LISTENING_PORT));
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
 * @returns {Array} List of {@link Host}.
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
                console.info(util.format('Host [%s] has been switched on.', docs.hwaddr));
                response = {"response": true};
            }

            res.json(response);
            next();
        });
    });
});

/**
 * Remove a host from database.
 * @param {number} host's id
 * @returns {boolean} true if the {@link Host} has been removed successfully.
 * False otherwise.
 */
server.del('/' + API_PREFIX + 'host/:hostid', function (req, res, next) {
    var hostid = parseInt(req.params.hostid, 10);
    console.log(util.format('remove(hostid=%s)', hostid));

    db.remove({id: hostid}, {}, function (err, numRemoved) {
        var response = {"response": false};

        if (err) {
            console.error(util.format('Could not remove host [%s]', hostid));
        } else {
            console.info('Host [%d] has been removed', hostid);
            response = {"response": true};
        }

        res.json(response);
        next();
    });
});

/**
 * Add a {@link Host} into database.
 * @param {string} host's hardware address
 * @returns {boolean} true if the {@link Host} has been added successfully.
 * False otherwise.
 */
server.post('/' + API_PREFIX + 'host', function (req, res, next) {
    var hwaddr = req.params.hwaddr;
    var hostname = req.params.hostname;
    console.log(util.format('addHost(hwaddr=%s;hostname=%s)', hwaddr, hostname));

    if (!isMac(hwaddr)) {
        throw new Error(util.format('The given hardware address ("%s") is not a valid MAC address.', hwaddr));
    }

    var response = {"response": false};
    var hostToAdd = new Host(0, hwaddr, hostname);

    db.insert([hostToAdd], function (err, docs) {
        var response = {"response": false};

        if (err) {
            console.error(util.format('Could not add new host [%s].', JSON.stringify(hostToAdd)));
        } else {
            console.info(util.format('Host [%s] has been added.', JSON.stringify(hostToAdd)));
            response = {"response": true};
        }

    res.json(response);
    next();
    });
});
