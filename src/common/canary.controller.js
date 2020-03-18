// Returns a function for generating an Express handler function that represents a canary endpoint.
// The canary endpoint reports on the health of the application, including its connections to
// external services. The function exported from this module accepts two arguments:
// - serviceChecks: An object which describes how to check third-party services. This is an object
//   where each key is the name of a service, and the corresponding value is a function which
//   returns a Promise which performs a check on the service. If the Promise resolves, the service
//   is reported as healthy. If it rejects, it is considered unhealthy, and the Error object it
//   rejects with is reported. If omitted, no services are checked.
// - envKeys: Environment variables to expose in the health endpoint response if the env_expose
//   environment variable is set to 'true'. This is an array containing either string names of
//   environment variables, or objects with two properties:
//   - name: The name of the environment variable.
//   - secret: Whether the variable's value is secret. If so, only its first and last characters
//     will be exposed.
//   The following environment variables are always included:
//   - apm_active
//   - apm_secretToken (secret)
//   - apm_serverUrl
//   - COMPUTERNAME
//   - debug
//   - express_port
//   - NODE_ENV
//   - npm_package_description
module.exports = (serviceChecks = {}, envKeys = []) => {
  envKeys = [
    'apm_active',
    { name: 'apm_secretToken', secret: true },
    'apm_serverUrl',
    'COMPUTERNAME',
    'debug',
    'express_port',
    'NODE_ENV',
    'npm_package_description',
    ...envKeys
  ].map(entry => {
    return typeof entry === 'object' ? entry : { name: entry, secret: false };
  });
  return (req, res) => {
    const services = {};
    const tasks = Object.entries(serviceChecks).map(entry => {
      const key = entry[0];
      return entry[1]().then(() => {
        global.common.debug(`${key} OK`);
        services[key] = 'OK';
      }).catch(err => {
        global.common.debug(`${key} FAIL`);
        services[key] = err || 'FAIL';
      });
    });
    Promise.all(tasks).then(() => {
      let env;
      const expose = process.env.env_expose || (process.env.NODE_ENV === 'production' ? null : 'true');

      if (expose === 'true') {
        env = envKeys.reduce((obj, entry) => {
          let value = process.env[entry.name];

          if (typeof value !== 'undefined') {
            if (entry.secret) {
              value = value.charAt(0) + '...' + value.charAt(value.length - 1);
            }

            obj[entry.name] = value;
          }

          return obj;
        }, {});
      }

      res.send({
        env,
        name: process.env.npm_package_name,
        pid: process.pid,
        platform: process.platform,
        services,
        version: process.env.npm_package_version
      });
    });
  };
};
