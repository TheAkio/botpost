'use strict';

const { EventEmitter } = require('events');

const clients = {};

try {
	// https://github.com/abalabahaha/eris
	const c = require('eris').Client;

	// Clustering: Eris supports clustering, shardID is given with the event
	// Guild Unavailability: Eris has two collections for guilds, although it has an event that is only emitted when an unavailable guild is created, which we can use
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
		getClientID: (cli) => cli.user.id,
		getShardCount: (cli) => {
			if (typeof cli.options.maxShards === 'string') throw new Error('Max shards are not known yet');
			return cli.options.maxShards;
		},
	};
} catch (e) {
	// Ignore
}

try {
	// https://github.com/hydrabolt/discord.js/
	const c = require('discord.js').Client;

	// Clustering: Discord.js does not support clustering, shardID is always the one in the client
	// Guild Unavailability: Discord.js stores all guilds in the same collection, the state doesn't matter
	clients.discordjs = {
		name: 'Discord.JS',
		class: c,
		getShardGuildCount: (cli) => cli.guilds.size,
		registerEvents: (cli, func) => {
			cli.on('ready', () => func(cli.options.shardId || 0));
			cli.on('guildCreate', () => func(cli.options.shardId || 0));
			cli.on('guildDelete', () => func(cli.options.shardId || 0));
		},
		getClientID: (cli) => cli.user.id,
		getShardCount: (cli) => cli.options.shardCount || 1,
	};
	clients.discordjs.class = c;
} catch (e) {
	// Ignore
}

try {
	// https://github.com/qeled/discordie
	const c = require('discordie');

	// Clustering: Discordie does not support clustering, shardID is always the one in the client
	// Guild Unavailability: Discordie has two collections for guilds, there is no event for unavailable guild create we are just using GUILD_CREATE and GUILD_DELETE for this library
	clients.discordie = {
		name: 'Discordie',
		class: c,
		getShardGuildCount: (cli) => {
			const availableCount = cli.Guilds.size;
			const unavailableCount = cli.UnavailableGuilds.length;
			return availableCount + unavailableCount;
		},
		registerEvents: (cli, func) => {
			cli.Dispatcher.on('GATEWAY_READY', () => func(cli.options.shardId || 0));
			cli.Dispatcher.on('GUILD_CREATE', () => func(cli.options.shardId || 0));
			cli.Dispatcher.on('GUILD_DELETE', () => func(cli.options.shardId || 0));
		},
		getClientID: (cli) => cli.User.id,
		getShardCount: (cli) => cli.options.shardCount || 1,
	};
} catch (e) {
	// Ignore
}

try {
	// https://github.com/izy521/discord.io
	const c = require('discord.io').Client;

	// Clustering: Discord.io does not support clustering, shardID is always the one in the client
	// Guild Unavailability: Discord.io stores all guilds in the same collection, the state doesn't matter
	clients.discordio = {
		name: 'Discord.IO',
		class: c,
		getShardGuildCount: (cli) => Object.keys(cli.servers).length,
		registerEvents: (cli, func) => {
			cli.on('ready', () => func(cli._shard ? cli._shard[0] : 0));
			cli.on('guildCreate', () => func(cli._shard ? cli._shard[0] : 0));
			cli.on('guildDelete', () => func(cli._shard ? cli._shard[0] : 0));
		},
		getClientID: (cli) => cli.id,
		getShardCount: (cli) => cli._shard ? cli._shard[1] : 1,
	};
} catch (e) {
	// Ignore
}

class ClientWrapper extends EventEmitter {
	constructor(cli) {
		super();
		this._cli = cli;

		for (const key in clients) {
			const info = clients[key];
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
			try {
				func(this.getClientID(), shardID, this.getShardCount(), this.getShardGuildCount(shardID));
			} catch (e) {
				// Ignore
			}
		});
	}

	getShardGuildCount(shardID) {
		return this._clientInfo.getShardGuildCount(this._cli, shardID);
	}

	getClientID() {
		return this._clientInfo.getClientID(this._cli);
	}

	getShardCount() {
		return this._clientInfo.getShardCount(this._cli);
	}
}

module.exports = ClientWrapper;
