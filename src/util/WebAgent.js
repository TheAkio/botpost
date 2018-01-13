'use strict';

const userAgent = `BotPost/v${require('../../package.json').version}`;

const http = require('http');
const https = require('https');
const { URL } = require('url');

const request = (method, url, body, headers) => new Promise((resolve, reject) => {
	const urlObj = new URL(url);
	url = `${urlObj.protocol}://${urlObj.host}/${urlObj.pathname}${urlObj.search ? `?${urlObj.search}` : ''}`;

	if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') throw new Error(`Invalid protocol ${urlObj.protocol}`);

	const lib = urlObj.protocol === 'https:' ? https : http;

	if (!headers) headers = {};
	headers['User-Agent'] = userAgent;

	const req = lib.request({
		method,
		host: urlObj.host,
		path: urlObj.pathname + (urlObj.search ? `?${urlObj.search}` : ''),
		headers,
	});

	let error = null;

	req.once('abort', () => {
		error = error || new Error(`Request aborted by client on ${method} ${url}`);
		Object.defineProperty(error, 'req', {
			value: req,
			enumerable: false,
		});
		reject(error);
	}).once('aborted', () => {
		error = error || new Error(`Request aborted by server on ${method} ${url}`);
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
				error = new Error(`${resp.statusCode}: ${response}`);
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
		error = new Error(`Request timed out (>15000ms) on ${method} ${url}`);
		req.abort();
	});

	if (Array.isArray(body)) {
		for (let chunk of body) req.write(chunk);
		req.end();
	} else if (typeof body === 'object') {
		req.end(JSON.stringify(body));
	} else {
		req.end(body);
	}
});

const get = (url, body, headers) => request('GET', url, body, headers);
const post = (url, body, headers) => request('POST', url, body, headers);

module.exports = { request, get, post };
