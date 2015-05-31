var config = {};
config.api = {};
config.client = {};

config.listeningPort = 8080;
config.api.urlPrefix = 'api/';
config.api.logger = {
        name: 'wwwol.js',
        stream: process.stdout
    };
config.client.urlPrefix = 'client/';

module.exports = config;
