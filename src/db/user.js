const crypto = require('crypto');
const Validate = require('../validate.util');
const MongoUtil = require('./util');

const REQUIRED_PROPERTIES_CREATE = [ 'email', 'name', 'roles', 'password' ];
const ALLOWED_PROPERTIES_EDIT = [ '_id', 'email', 'name', 'roles', 'password' ];
const ROLES = [ 'volunteer', 'champion', 'admin' ];

module.exports = db => {
  const collection = db.collection('user');

  // Retrieves the user with the given email address.
  const findByEmail = async (email, sanitizeUser = true) => {
    const user = await MongoUtil.findOne(collection, { email: { $eq: email } });
    return sanitizeUser ? sanitize(user) : user;
  };

  const api = {
    // Creates a new user
    create: async user => {
      validateUser(user);

      if (await findByEmail(user.email, false)) {
        Validate.error400(`User already exists: ${user.email}`);
      }

      user.salt = generateSalt();
      user.passwordHash = hashPassword(user.password, user.salt);
      delete user.password;
      await collection.insertOne(user);
      return MongoUtil.convertObjectIds(sanitize(user));
    },

    // Returns the user with the given email address if their password is correct. Returns null if
    // no such user exists or the password is wrong.
    authenticate: async (email, password) => {
      let user = await findByEmail(email, false);

      if (!user) {
        return null;
      }

      const hash = hashPassword(password, user.salt);

      if (hash !== user.passwordHash) {
        return null;
      }

      return sanitize(user);
    },

    // Retrieves the user with the given ID.
    get: async id => sanitize(await MongoUtil.findById(collection, id)),

    // Retrieves the user with the given email address.
    findByEmail: email => findByEmail(email),

    // Retrieves a list of all users.
    list: () => MongoUtil.find(collection, {}, sanitize),

    // Updates a user record and retrieves the resulting record.
    update: async update => {
      validateUpdate(update);
      const id = MongoUtil.id(update._id);
      delete update._id;
      const q = { _id: { $eq: id }};
      const user = await collection.findOne(q);

      if (user === null) {
        error400(`User does not exist: ${id.toString()}`);
      }

      if ('password' in update) {
        update.passwordHash = hashPassword(update.password, user.salt);
      }

      await collection.updateOne(q, { $set: update });
      return api.get(id);
    },

    // Deletes the given user record, or the record with the given ID
    delete: async objOrId => {
      let id = null;

      if (typeof objOrId === 'object' && objOrId !== null && !Array.isArray(objOrId)) {
        id = objOrId._id;
      } else if (typeof objOrId === 'string') {
        id = objOrId;
      }

      if (!(typeof id === 'string')) {
        Validate.error400(`Expected object to delete or its ID; got this instead: ${objOrId}`);
      }

      await collection.deleteOne({ _id: { $eq: MongoUtil.id(id) }});
    }
  };
  return api;
};

// Generates a new random hex string that can be used as a salt value.
const generateSalt = () => crypto.randomBytes(16).toString('hex');

// Returns a password hash, given a password and salt
const hashPassword = (password, salt) => crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');

// Throws an Error if the given user object is invalid for creation.
const validateUser = user => {
  Validate.requiredProperties(user, REQUIRED_PROPERTIES_CREATE);
  Validate.onlyTheseProperties(user, REQUIRED_PROPERTIES_CREATE);
  Validate.string(user, '_id');
  Validate.string(user, 'name');
  Validate.string(user, 'email');
  // TODO Validate that it's a valid email address
  Validate.array(user, 'roles', ROLES);

  if (!user.roles.length) {
    Validate.error400('You must specify at least one role');
  }
};

// Throws an Error if the given user update object is invalid.
const validateUpdate = update => {
  if (!update._id) {
    Validate.error400('An _id property is required');
  }

  Validate.onlyTheseProperties(update, ALLOWED_PROPERTIES_EDIT);
  Validate.string(update, '_id');
  Validate.string(update, 'name');
  Validate.string(update, 'email');
  // TODO Validate that it's a valid email address
  Validate.array(update, 'roles', ROLES);
  Validate.string(update, 'password');
};

// Removes any secret fields from a user object.
const sanitize = user => {
  if (user === null) {
    return null;
  }

  const sanitized = { ...user };
  delete sanitized.salt;
  delete sanitized.passwordHash;
  return sanitized;
};
