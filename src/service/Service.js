'use strict';

class Service {
	constructor(name) {
		this._name = name;
	}

	getName() {
		return this._name;
	}

	post() {
		throw new Error(`Service: post function not overridden in ${this.name}`);
	}
}

module.exports = Service;
