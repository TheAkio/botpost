'use strict';

const { EventEmitter } = require('events');

const clients = {};

try {
	// https://github.com/abalabahaha/eris
	const c = require('eris').Client;

	clients.eris = {
		name: 'Eris',
		class: c,
		getShardGuildCount: (cli, shardID) => {
			const availableCount = cli.guilds.filter(g => g.shard.id === shardID).length;
			const unavailableCount = cli.unavailableGuilds.filter(g => g.shard.id === shardID).length;
			return availableCount + unavailableCount;
		},
		registerEvents: (cli, func) => {
			cli.on('shardReady', (id) => func(id));
			cli.on('guildCreate', (guild) => func(guild.shard.id));
			cli.on('guildDelete', (guild) => func(guild.shard.id));
			cli.on('unavailableGuildCreate', (guild) => func(guild.shard.id));
		},
	};
} catch (e) {
	// Ignore
}

try {
	// https://github.com/hydrabolt/discord.js/
	const c = require('discord.js').Client;

	clients.discordjs = {
		name: 'Discord.JS',
		class: c,
	};
	clients.discordjs.class = c;
} catch (e) {
	// Ignore
}

try {
	// https://github.com/qeled/discordie
	const c = require('discordie');

	clients.discordie = {
		name: 'Discordie',
		class: c,
	};
} catch (e) {
	// Ignore
}

try {
	// https://github.com/izy521/discord.io
	const c = require('discord.io').Client;

	clients.discordio = {
		name: 'Discord.IO',
		class: c,
	};
} catch (e) {
	// Ignore
}

class ClientWrapper extends EventEmitter {
	constructor(cli) {
		super();
		this._cli = cli;

		for (const info in clients) {
			if (!(cli instanceof info.class)) continue;
			this._clientInfo = info;
			break;
		}

		if (!this._clientInfo) throw new Error('ClientWrapper: The given client is not supported');
	}

	getClientName() {
		return this._clientInfo.name;
	}

	registerFunction(func) {
		this._clientInfo.registerEvents(this._cli, (shardID) => {
			func(shardID, this.getShardGuildCount(shardID));
		});
	}

	getShardGuildCount(shardID) {
		return this.clientInfo.getShardGuildCount(shardID);
	}
}

module.exports = ClientWrapper;
