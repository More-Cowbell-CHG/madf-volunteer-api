// Logging module. This module sets up Winston, and applies a custom transport if APM is disabled
// so that logged content is more friendly for developers.
const winston = require('winston');
const AnsiConsoleTransport = require('./ansiConsoleTransport.winston');

const NVM_LOG_LEVELS = [ 'error', 'warn', 'info', 'verbose', 'debug', 'silly' ];

const DEBUG = process.execArgv.includes('--inspect');
const DEV = (process.env.NODE_ENV || 'development') === 'development';

exports.defaultConfig = {
  level: typeof process.env.NODE_ENV !== 'undefined' && process.env.NODE_ENV !== 'development' ? 'info' : 'debug',
  exitOnError: false
};

exports.init = logConfig => {
  const apmActive = global.common ? global.common.config.get('apm.active') : false;

  // Initialize Winston
  const transport = apmActive ? new winston.transports.Console() : new AnsiConsoleTransport();
  const logger = winston.createLogger({
    transports: [ transport ],
    ...logConfig
  });
  const contribution = {};
  NVM_LOG_LEVELS.forEach(level => {
    contribution[level] = (message, metadata) => {
      logger[level]({ message, ...metadata });
    };
  });
  return contribution;
};
