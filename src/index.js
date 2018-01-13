'use strict';

const BotPost = require('./BotPost');

function Export(options) {
	return new BotPost(options);
}

Export.BotPost = BotPost;
Export.Service = require('./service/Service');

module.exports = Export;
