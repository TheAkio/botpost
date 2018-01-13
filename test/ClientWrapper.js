'use strict';
/* global describe, it */

const assert = require('assert');

const ClientWrapper = require('../src/util/ClientWrapper');

const runLibraryTest = (name, req, init) => {
	describe(name, () => {
		let lib;
		it('library should be requirable', () => {
			lib = require(req);
		});
		let wrapper;
		it('wrapper should initialize', () => {
			assert(lib);
			const cli = init(lib);
			wrapper = new ClientWrapper(cli);
		});
		it('wrapper should register events', () => {
			assert(wrapper);
			wrapper.registerFunction(() => {
				// Empty func
			});
		});
		it('wrapper should return 0 when calling getShardGuildCount', () => {
			assert(wrapper);
			assert(wrapper.getShardGuildCount() === 0);
		});
	});
};

describe('ClientWrapper', () => {
	runLibraryTest('Eris', 'eris', (lib) => new lib.Client());
	runLibraryTest('Discord.js', 'discord.js', (lib) => new lib.Client());
	runLibraryTest('Discordie', 'discordie', (lib) => new lib());
	runLibraryTest('Discord.io', 'discord.io', (lib) => {
		const cli = new lib.Client({});
		// We need this so the test doesn't fail
		// They will probably never change the name of the servers property
		cli.servers = {};
		return cli;
	});
});
