'use strict';

const http = require('http');
const https = require('https');
const { URL } = require('url');

const request = (method, url, body, headers) => new Promise((resolve, reject) => {
	const urlObj = new URL(url);
	url = `${url.protocol}://${url.host}/${url.path}${url.search ? `?${url.search}` : ''}`;

	if (urlObj.protocol !== 'http' && urlObj.protocol !== 'https') throw new Error(`WebAgent: Invalid protocol ${url.protocol}`);

	const lib = urlObj.protocol === 'https' ? https : http;
	const req = lib.request({
		method,
		host: url.host,
		path: url.path + (url.search ? `?${url.search}` : ''),
		headers,
	});

	let error = null;

	req.once('abort', () => {
		error = error || new Error(`WebAgent: Request aborted by client on ${method} ${url}`);
		Object.defineProperty(error, 'req', {
			value: req,
			enumerable: false,
		});
		reject(error);
	}).once('aborted', () => {
		error = error || new Error(`WebAgent: Request aborted by server on ${method} ${url}`);
		Object.defineProperty(error, 'req', {
			value: req,
			enumerable: false,
		});
		reject(error);
	}).once('error', err => {
		error = err;
		req.abort();
	});

	req.once('response', resp => {
		let response = '';

		resp.on('data', data => {
			response += data;
		}).once('end', () => {
			if (response.length > 0) {
				if (resp.headers['content-type'] === 'application/json') {
					try {
						response = JSON.parse(response);
					} catch (e) {
						error = new Error(`Could not parse JSON: ${e ? e.message ? e.message : JSON.stringify(e) : e}`);
						error.cause = e;
						error.response = response;
						Object.defineProperty(error, 'req', {
							value: req,
							enumerable: false,
						});
						Object.defineProperty(error, 'resp', {
							value: req,
							enumerable: false,
						});
						return reject(error);
					}
				}
			}

			if (resp.statusCode >= 300) {
				error = new Error(`MAKE THIS TEXT BETTER PLS`);
				error.status = resp.statusCode;
				error.response = response;
				Object.defineProperty(error, 'req', {
					value: req,
					enumerable: false,
				});
				Object.defineProperty(error, 'resp', {
					value: req,
					enumerable: false,
				});
				return reject(error);
			}

			resolve({
				status: resp.statusCode,
				req,
				resp,
				response,
			});
		});
	});

	req.setTimeout(15000, () => {
		error = new Error(`WebAgent: Request timed out (>15000ms) on ${method} ${url}`);
		req.abort();
	});

	if (typeof body === 'string' || typeof body === 'number') {
		req.end(body);
	} else if (Array.isArray(body)) {
		for (let chunk of body) req.write(chunk);
		req.end();
	} else {
		// Assuming object
		req.end(JSON.stringify(body));
	}
});

const get = (url, body, headers) => request('GET', url, body, headers);
const post = (url, body, headers) => request('POST', url, body, headers);

module.exports = { request, get, post };
