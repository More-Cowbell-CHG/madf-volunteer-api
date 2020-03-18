/* eslint-disable no-unused-vars */
if (typeof process.env.npm_package_version === 'undefined') {
  throw Error('Please launch with the "npm start" command.');
}

require('./common')({
  // default config options go here
});

// Shuts down the server
const terminate = async () => {
  await global.common.express.stop();
  // perform other shutdown operations here
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
global.common.express.start({
  routers: require('./router')
});
