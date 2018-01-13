'use strict';

const Service = require('./Service');
const WebAgent = require('../util/WebAgent');

class BotsDiscordPw extends Service {
	constructor(token) {
		super('bots.discord.pw');
		this.token = token;
	}

	post(clientID, shardID, shardCount, guildCount) {
		return new Promise((resolve, reject) => {
			WebAgent.post(`https://bots.discord.pw/api/bots/${clientID}/stats`,
				{
					server_count: guildCount,
					shard_id: shardID,
					shard_count: shardCount,
				},
				{
					'Content-Type': 'application/json',
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
