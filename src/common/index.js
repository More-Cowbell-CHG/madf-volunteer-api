// Provides configuration, logging, Express
const config = require('./config');
const MODULE_NAMES = [ 'log', 'express' ];

module.exports = appDefaults => {
  const cs = {};
  global.common = cs;

  // Initialize configuration
  let commonDefaults = {
    debug: process.execArgv.includes('--inspect')
  };
  const modules = MODULE_NAMES.map(name => {
    const module = require('./' + name);
    module.name = name;
    return module;
  });
  modules.forEach(module => {
    commonDefaults[module.name] = module.defaultConfig;
  });
  config({ ...commonDefaults, ...appDefaults });

  // Initialize other modules
  modules.forEach(module => {
    const contribution = module.init(global.common.config.toObject(module.name));
    Object.entries(contribution).forEach(entry => {
      cs[entry[0]] = entry[1];
    });
  });

  // Log some config details
  cs.info(`${process.env.npm_package_name} v${process.env.npm_package_version}`);
  cs.info(`Debugging is ${cs.config.get('debug') ? 'ON' : 'OFF'}`);
  cs.info(`Log level set to ${cs.config.get('log.level').toUpperCase()}`);
};
