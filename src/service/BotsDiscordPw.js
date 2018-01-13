'use strict';

const Service = require('./Service');
const WebAgent = require('../util/WebAgent');

class BotsDiscordPw extends Service {
	constructor(uagent, token) {
		super('bots.discord.pw');
		this.uagent = uagent;
		this.token = token;
	}

	post(clientID, shardID, shardCount, guildCount) {
		return new Promise((resolve, reject) => {
			WebAgent.post(`https://discordbots.org/api/bots/${clientID}/stats`,
				{
					server_count: guildCount,
					shard_id: shardID,
					shard_count: shardID,
				},
				{
					'User-Agent': 'BotPost/v0.0.1',
					'Content-Type': 'application-json',
					Authorization: this.token,
				}
			).then(() => {
				resolve();
			}).catch(e => {
				reject(e);
			});
		});
	}
}

module.exports = BotsDiscordPw;
