const Mongo = require('mongodb');

// Converts MongoDB ObjectIds into strings. Walks any objects or arrays encountered.
const convertObjectIds = val => {
  if (Array.isArray(val)) {
    return val.map(convertObjectIds);
  }

  if (typeof val === 'object' && val !== null) {
    if ('_bsontype' in val && val._bsontype === 'ObjectID') {
      return val.toString();
    }

    return Object.fromEntries(
      Object.entries(val)
        .map(entry => [ entry[0], convertObjectIds(entry[1]) ])
    );
  }

  return val;
};

// Accepts a collection and an optional query object. Retrieves the data specified by the query,
// converts any ObjectIds to strings, and returns the results as an array. If a map function is
// provided, the resulting array is mapped through it.
// TODO Add support for pagination
exports.find = async (collection, query = {}, mapFn) => {
  const arr = convertObjectIds(await collection.find(query).toArray());
  return mapFn ? arr.map(mapFn) : arr;
};

// Accepts a collection and query object. Retrieves the data specified by the query, converts any\
// ObjectIds to strings, and returns the result.
// TODO Add support for pagination
exports.findOne = async (collection, query) => {
  return convertObjectIds(await collection.findOne(query));
};

// Converts a string ID to a Mongo ObjectID.
exports.id = id => new Mongo.ObjectID(id);

// Retrieves a document by ID.
exports.findById = (collection, id) => exports.findOne(collection, { _id: exports.id(id) });

exports.convertObjectIds = convertObjectIds;
