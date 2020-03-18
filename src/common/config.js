// Configuration module. Provides default values functionality to dotenv.

// This module exports a function. Pass it an object containing the default configuration values for
// your application. (You may pass undefined or null to specify no defaults.) The function sets up
// a global.common.config object with these function properties:
//
// - get(key): Retrieves the given configuration value, coerced to a null, boolean, or number if
//   possible.
//
// - toObject(keyPrefix): Retrieves all configuration values with the given prefix as an object.
//   Underscores in the key names after the prefix will be treated as indicating a sub-object. All
//   values will be coerced as if returned via get().

// Writes the values in the given default object to any undefined process.env properties. Default
// values which are objects are flattened using underscores between path keys. All values are
// coerced to strings when stored (since that's all process.env supports).
const writeDefaults = (defaults, prefix = '') => {
  for (const key in defaults) {
    const defaultValue = defaults[key];
    const currentValue = process.env[prefix + key];

    if (typeof defaultValue === 'object') {
      writeDefaults(defaultValue, prefix + key + '_');
    } else if (typeof currentValue === 'undefined') {
      process.env[prefix + key] = defaultValue.toString();
    }
  }
};

// Returns the given string coerced as follows:
// - Returns null if passed 'null'
// - Returns the corresponding boolean if passed 'true' or 'false'
// - Returns a number if the string can be parsed as a number
// - Returns the string
const coerceString = str => {
  if (str === 'null') {
    return null;
  }

  if (str === 'true') {
    return true;
  }

  if (str === 'false') {
    return false;
  }

  // Does this look like a number?
  if (/^-?[0-9]+(\.[0-9]+)?$/.test(str)) {
    const numVal = +str;
    return isNaN(numVal) ? str : numVal;
  }

  return str;
};

// Writes the given value to the indicated object tree, using an array of key values as a path to
// the desired location.
const writeToObjectTree = (obj, path, value) => {
  const nextEl = path[0];

  if (path.length === 1) {
    obj[nextEl] = coerceString(value);
    return;
  }

  if (typeof obj[nextEl] === 'undefined') {
    obj[nextEl] = {};
  }

  writeToObjectTree(obj[nextEl], path.slice(1), value);
};

// Returns the named value (expressed as an object path) from process.env. Dots in the path are
// converted to underscores.
const get = path => {
  return coerceString(process.env[path.replace(/\./g, '_')]);
};

// Returns all configuration values with the given prefix as an object. Underscores in the key names
// after the prefix will be treated as indicating a sub-object.
const toObject = prefix => {
  prefix += '_';
  let obj = {};

  for (const key in process.env) {
    if (!key.startsWith(prefix)) {
      continue;
    }

    let path = key.substring(prefix.length).split('_');
    writeToObjectTree(obj, path, process.env[key]);
  }

  return obj;
};

module.exports = defaultObj => {
  require('dotenv').config();

  if (defaultObj) {
    writeDefaults(defaultObj);
  }

  global.common.config = { get, toObject };
};
