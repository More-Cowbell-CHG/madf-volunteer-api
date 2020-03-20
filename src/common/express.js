/* eslint-disable no-ex-assign, no-console */
// Express module. After invoking init(), the global.common.express object will exist. It has two
// functions, start() and stop(), to start and stop Express, respectively. This module deals with
// JWT decoding, error handling, and endpoint access logging when APM is disabled.
const express = require('express');
const canary = require('./canary.controller');
const cors = require('cors');

let config, server;

// Returns a Promise which resolves to a running Express instance. The function takes two arguments:
// - routers: The routers to attach to the Express instance. This can be given as a single object or
//   an array.
// - serviceChecks: An object where each property is a function that returns a Promise which checks
//   the named service dependency. Each function must resolve if the check is successful, and must
//   reject (preferably with an error object) if it is not.
// - envKeys: An array of environment variables to expose. Each entry is either the string name of
//   the environment variable, or an object with two properties:
//   - name: The name of the environment variable
//   - secret: (default = false) Whether the value of the key is secret and should therefore be
//     redacted. Redacted values display only their first and last characters.
const start = ({ routers, serviceChecks, envKeys }) => {
  return new Promise(resolve => {
    let app = express();
    app.use(express.json());

    app.use(cors());

    app.use(logAccess);
    const canaryEndpoint = canary(serviceChecks, envKeys);
    app.get('/', canaryEndpoint);
    app.get('/health', canaryEndpoint);

    if (Array.isArray(routers)) {
      routers.forEach(obj => app.use('/', obj(express)));
    } else {
      app.use('/', routers(express));
    }

    app.use(errorHandler);
    server = app.listen(config.port, () => {
      config.log.info(`Listening on port ${config.port}`);
      resolve(app);
    });
  });
};

// Returns a Promise that stops the running Express instance.
const stop = async () => {
  if (!server) {
		return;
	}

	config.log.verbose('Stopping web server...');
	await server.close();
	config.log.verbose('Web server stopped.');
};

// Logs access to an endpoint.
const logAccess = (req, res, next) => {
  let qs = Object.entries(req.query).map(entry => entry[0] + '=' + entry[1]).join('&');

  if (qs) {
    qs = '?' + qs;
  }

  config.log.verbose(`${req.method} ${req.path}${qs}`); // TODO Show authenticated user
  next();
};

// Handles errors passed to next() in Express. NOTE THAT next IS REQUIRED IN THE FUNCTION SIGNATURE,
// EVEN THOUGH IT IS UNUSED. Otherwise Express will not recognize it as an error handler.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
	if (!err.statusCode) {
		err.statusCode = 500;
	}

	if (err.statusCode === 500) {
		config.log.error(err);
	}

	const payload = { error: err.message };

	if (config.debug && err.stack) {
		payload.stack = err.stack;
	}

	res.status(err.statusCode).send(payload);
};

exports.defaultConfig = {
  port: process.env.PORT || 8080
};

exports.init = expressConfig => {
  config = expressConfig;
  config.debug = global.common ? global.common.config.get('debug') : true;
  config.log = global.common || {
    error: console.error,
    info: console.log,
    verbose: console.log,
    debug: console.log
  };
  return {
    express: { start, stop }
  };
};
