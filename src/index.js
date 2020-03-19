/* eslint-disable no-unused-vars */
if (typeof process.env.npm_package_version === 'undefined') {
  throw Error('Please launch with the "npm start" command.');
}

require('./common')({
  mongo: {
    dbName: 'madf-volunteer'
  }
});

// Shuts down the server
const terminate = async () => {
  await global.common.express.stop();
  global.db.close();
};

process.on('SIGINT', () => {
  global.common.debug('Received SIGINT');
  terminate();
});
process.on('unhandledRejection', reason => {
  global.common.error(reason);
  terminate();
});

// Start the server
require('./db/db')(global.common.config.toObject('mongo')).then(db => {
  global.db = db;
  global.common.express.start({
    routers: require('./router')
  });
});
