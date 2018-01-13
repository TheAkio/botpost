'use strict';

class Service {
	constructor(name) {
		this._name = name;
	}

	getName() {
		return this._name;
	}

	post() {
		return new Promise((resolve, reject) => reject(new Error(`Service: post function not overridden in ${this.name}`)));
	}
}

module.exports = Service;
