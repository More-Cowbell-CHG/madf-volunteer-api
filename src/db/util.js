const Mongo = require('mongodb');
const Validate = require('../validate.util');

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
// converts any ObjectIds to strings, and returns the results as an array. You may optionally
// provide a Mongo projection and/or a map function to transform the result set.
// TODO Add support for pagination
exports.find = async (collection, query = {}, projection, mapFn) => {
  let cursor = collection.find(query, projection ? { projection } : undefined);
  const arr = convertObjectIds(await cursor.toArray());
  return mapFn ? arr.map(mapFn) : arr;
};

// Accepts a collection and query object. Retrieves the data specified by the query, converts any\
// ObjectIds to strings, and returns the result. You may optionally provide a Mongo projection to
// transform the returned object.
// TODO Add support for pagination
exports.findOne = async (collection, query, projection) => {
  return convertObjectIds(await collection.findOne(query, projection ? { projection } : undefined));
};

// Accepts a collection and an object to delete or its ID, and deletes that object.
exports.deleteOne = async (collection, objOrId) => {
  let id = null;

  if (typeof objOrId === 'object' && objOrId !== null && !Array.isArray(objOrId)) {
    id = objOrId._id;
  } else if (typeof objOrId === 'string') {
    id = objOrId;
  }

  if (!(typeof id === 'string')) {
    Validate.error400(`Expected object to delete or its ID; got this instead: ${objOrId}`);
  }

  await collection.deleteOne({ _id: { $eq: exports.id(id) }});
};

// Converts a string ID to a Mongo ObjectID.
exports.id = id => typeof id === 'string' ? new Mongo.ObjectID(id) : id;

// Retrieves a document by ID.
exports.findById = (collection, id) => exports.findOne(collection, { _id: exports.id(id) });

// Builds a Mongo projection object that will exclude the properties named in the given array.
exports.exclusionProjection = keys => {
  return keys.reduce((acc, cur) => {
    acc[cur] = 0;
    return acc;
  }, {});
};

exports.convertObjectIds = convertObjectIds;
