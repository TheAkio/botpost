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
		error.req = req;
		reject(error);
	}).once('aborted', () => {
		error = error || new Error(`WebAgent: Request aborted by server on ${method} ${url}`);
		error.req = req;
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
			// If not 200 or so reject with error and response
			// Otherwise resolve with response, also parse to JSON if application-type is json
			// Return response headers too!
		});
	});

	req.setTimeout(15000, () => {
		error = new Error(`WebAgent: Request timed out (>15000ms) on ${method} ${url}`);
		req.abort();
	});

	if (Array.isArray(body)) {
		for (let chunk of body) req.write(chunk);
		req.end();
	} else {
		req.end(body);
	}
});

const post = (url, body, headers) => request('POST', url, body, headers);

module.exports = { request, post };
