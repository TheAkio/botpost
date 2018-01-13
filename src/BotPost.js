'use strict';

const { EventEmitter } = require('events');

const ClientWrapper = require('./util/ClientWrapper');
const Service = require('./service/Service');

class BotPost extends EventEmitter {
	constructor(options) {
		super();
		this._services = [];

		if (!options) return;
	}

	addClient(client) {
		const wrapper = new ClientWrapper(client);
		wrapper.registerFunction((shardID, guildCount) => {
			this.emit('debug', `Received guild count update on ${wrapper.getClientName()} client (shardID: ${shardID}, guildCount: ${guildCount})`);
			for (const service of this._services) service.post(shardID, guildCount);
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
