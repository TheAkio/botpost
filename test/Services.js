'use strict';
/* global describe, it */

const assert = require('assert');

const BotsDiscordPw = require('../src/service/BotsDiscordPw');

describe('Services', () => {
	describe('BotsDiscordPw', () => {
		let service;
		it('should initialize', () => {
			service = new BotsDiscordPw('<TOKEN>');
		});
		it('should successfully do a request', async() => {
			assert(service != null);
			await service.post('<ID>', 0, 1, 1);
		});
	});
});
