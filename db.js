"use strict";

var Datastore = require('nedb');

var DB_PATH = './hosts.db';
var db = new Datastore({ filename: DB_PATH, autoload: true });

module.exports = db;
