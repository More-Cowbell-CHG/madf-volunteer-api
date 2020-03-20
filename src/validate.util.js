// Throws an error with a 400 status code.
const error = msg => {
  const err = Error(msg);
  err.statusCode = 400;
  throw err;
};

// Returns true if the argument is null or undefined.
const undefinedOrNull = value => {
  return typeof value === 'undefined' || value === null;
}

// Throws an Error if the given object is missing any of the keys named in the keys array.
exports.requiredProperties = (obj, keys) => {
  const missing = keys.filter(key => !(key in obj));

  if (missing.length) {
    error(`Required properties missing: ${missing.join(', ')}`);
  }
};

// Throws an Error if the given object has any keys other than the ones named in the keys array.
exports.onlyTheseProperties = (obj, keys) => {
  const unknown = Object.keys(obj).filter(key => !keys.includes(key));

  if (unknown.length) {
    error(`Properties not allowed: ${unknown.join(', ')}`);
  }
};

// Throws an Error if the value of the named property is not null, undefined, or an array. If the
// validValues argument is an array, an Error will be thrown if the array contains any elements that
// are not included in the validValues array.
exports.array = (obj, key, validValues) => {
  const val = obj[key];

  if (undefinedOrNull(val)) {
    return;
  }

  if (!Array.isArray(val)) {
    error(`The '${key}' property must be an array, not this: ${val}`);
  }

  if (Array.isArray(validValues)) {
    const invalid = val.filter(el => !validValues.includes(el));

    if (invalid.length) {
      error(`Invalid values found in '${key}' array: ${JSON.stringify(invalid)}. Must be one of: ${validValues.join(', ')}`);
    }
  }
};

// Throws an Error if the value of the named property is not null, undefined, or a plain, non-array
// object.
exports.object = (obj, key) => {
  const val = obj[key];

  if (undefinedOrNull(val) || typeof val === 'object' && !Array.isArray(val)) {
    return;
  }

  error(`The '${key}' property must be a plain object, not this: ${val}`);
};

// Throws an Error if the value of the named property is not null, undefined, or a string. If the
// validValues array is specified, an Error will be thrown if the string is not included in the
// validValues array.
exports.string = (obj, key, validValues) => {
  const val = obj[key];

  if (undefinedOrNull(val)) {
    return;
  }

  if (typeof val !== 'string') {
    error(`The '${key}' property must be a string, not this: ${val}`);
  }

  if (Array.isArray(validValues) && !validValues.includes(val)) {
    error(`Invalid value for '${key}' property: ${val}. Must be one of: ${validValues.join(', ')}`);
  }
};

// Throws an Error if the value of the named property is not null, undefined, or a number. If the
// min or max arguments are specified, an Error will be thrown if the number is less than min or
// greater than max.
exports.number = (obj, key, min, max) => {
  const val = obj[key];

  if (undefinedOrNull(val)) {
    return;
  }

  if (typeof val !== 'number') {
    error(`The '${key}' property must be a number, not this: ${val}`);
  }

  if (!undefinedOrNull(min) && val < min) {
    error(`The '${key}' property is ${val}, but is not allowed to be less than ${min}`);
  }

  if (!undefinedOrNull(max) && val > max) {
    error(`The '${key}' property is ${val}, but is not allowed to be greater than ${max}`);
  }
};

exports.error400 = error;
