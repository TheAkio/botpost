'use strict';

const BotPost = require('./BotPost');

function Exports(options) {
	return new BotPost(options);
}

Exports.BotPost = BotPost;
Exports.Service = require('./service/Service');
Exports.WebAgent = require('./util/WebAgent');

module.exports = Exports;
