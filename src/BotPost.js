'use strict';

const { EventEmitter } = require('events');

const ClientWrapper = require('./util/ClientWrapper');
const Service = require('./service/Service');

const BotsDiscordPw = require('./service/BotsDiscordPw');

class BotPost extends EventEmitter {
	constructor(client, options) {
		super();
		this._services = [];

		this.uagent = `BotPost/v${require('../package.json').version}`;

		if (client) this.addClient(client);

		if (!options) return;

		if (options.botsDiscordPw) this.addService(new BotsDiscordPw(options.botsDiscordPw));
	}

	addClient(client) {
		const wrapper = new ClientWrapper(client);
		wrapper.registerFunction((...args) => {
			this.emit('debug', `Received guild count update on ${wrapper.getClientName()} client (clientID: ${args[0]}, shard: ${args[1]}/${args[2]}, guildCount: ${args[3]})`);
			for (const service of this._services) service.post(...args);
		});

		this.emit('debug', `Added client: ${wrapper.getClientName()}`);
	}

	addService(service) {
		if (!(service instanceof Service)) throw new Error('BotPost: addService(), argument does not extend class Service');
		this._services.push(service);

		this.emit('debug', `Added service: ${service.getName()}`);
	}
}

module.exports = BotPost;
