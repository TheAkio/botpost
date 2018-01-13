'use strict';

const BotPost = require('./BotPost');

function Exports(options) {
	return new BotPost(options);
}

Exports.BotPost = BotPost;
Exports.Service = require('./service/Service');

module.exports = Exports;
