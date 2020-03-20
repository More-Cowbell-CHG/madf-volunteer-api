const crypto = require('crypto');
const Validate = require('../validate.util');
const MongoUtil = require('./util');

const REQUIRED_PROPERTIES_CREATE = [ 'email', 'name', 'roles', 'password' ];
const ALLOWED_PROPERTIES_EDIT = [ '_id', 'email', 'name', 'roles', 'password' ];
const ROLES = [ 'volunteer', 'champion', 'admin' ];
const SECRET_PROPERTIES = [ 'salt', 'passwordHash' ];
const SANITIZE_PROJECTION = MongoUtil.exclusionProjection(SECRET_PROPERTIES);

module.exports = db => {
  const collection = db.collection('user');

  // Retrieves the user with the given email address.
  const findByEmail = async (email, sanitizeUser = true) => {
    const projection = sanitizeUser ? SANITIZE_PROJECTION : undefined;
    return await MongoUtil.findOne(collection, { email: { $eq: email } }, projection);
  };

  const api = {
    // Creates a new user
    create: async user => {
      user = { ...user };
      validateUser(user);

      if (await findByEmail(user.email, false)) {
        Validate.error400(`User already exists: ${user.email}`);
      }

      user.salt = generateSalt();
      user.passwordHash = hashPassword(user.password, user.salt);
      delete user.password;
      user = collection.insertOne(user);
      return api.get(obj._id);
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
    list: () => MongoUtil.find(collection, {}, SANITIZE_PROJECTION),

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

      if (update.email && update.email !== user.email) {
        if (await findByEmail(update.email, false)) {
          Validate.error400(`Email address is in use by another account: ${user.email}`);
        }
      }

      if ('password' in update) {
        update.passwordHash = hashPassword(update.password, user.salt);
        delete update.password;
      }

      await collection.updateOne(q, { $set: update });
      return api.get(id);
    },

    // Deletes the given user record, or the record with the given ID
    delete: objOrId => MongoUtil.deleteOne(collection, objOrId)
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

// Returns a copy of the given object with the secret properties removed.
const sanitize = user => {
  if (user === null) {
    return null;
  }

  const sanitized = { ...user };
  SECRET_PROPERTIES.forEach(key => {
    delete sanitized[key];
  });
  return sanitized;
};
