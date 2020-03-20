const error = msg => {
  const err = Error(msg);
  err.statusCode = 400;
  throw err;
};

const undefinedOrNull = value => {
  return typeof value === 'undefined' || value === null;
}

exports.requiredProperties = (obj, keys) => {
  const missing = keys.filter(key => !(key in obj));

  if (missing.length) {
    error(`Required properties missing: ${missing.join(', ')}`);
  }
};

exports.onlyTheseProperties = (obj, keys) => {
  const unknown = Object.keys(obj).filter(key => !keys.includes(key));

  if (unknown.length) {
    error(`Properties not allowed: ${unknown.join(', ')}`);
  }
};

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
      error(`Invalid values found in '${key}' array: ${JSON.stringify(invalid)}`);
    }
  }
};

exports.string = (obj, key, validValues) => {
  const val = obj[key];

  if (undefinedOrNull(val)) {
    return;
  }

  if (typeof val !== 'string') {
    error(`The '${key}' property must be a string, not this: ${val}`);
  }

  if (Array.isArray(validValues) && !validValues.includes(val)) {
    error(`Invalid value for '${key}' property: ${val}`);
  }
};

exports.error400 = error;
