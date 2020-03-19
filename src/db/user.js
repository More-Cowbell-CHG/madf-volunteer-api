const crypto = require('crypto');
const Validate = require('../validate.util');

const REQUIRED_PROPERTIES = [ 'email', 'name', 'roles', 'password' ];
const ROLES = [ 'volunteer', 'champion', 'admin' ];

module.exports = db => {
  const collection = db.collection('user');
  return {
    // Creates a new user
    create: async user => {
      if ('_id' in user) {
        Validate.error400('Can\'t create a user with an _id');
      }

      await validateUser(user);
      user.salt = generateSalt();
      user.passwordHash = hashPassword(user.password, user.salt);
      delete user.password;
      await coll.insertOne(user);
      sanitizeUser(user);
      return user;
    },

    // Returns the user with the given email address if their password is correct. Returns null if
    // no such user exists or the password is wrong.
    authenticate: async (email, password) => {
      let user = await findByEmail(email);

      if (!user) {
        return null;
      }

      const hash = hashPassword(password, user.salt);

      if (hash !== user.passwordHash) {
        return null;
      }

      return sanitizeUser(user);
    },

    // Retrieves the user with the given email address.
    findByEmail: async email => sanitizeUser(await findByEmail(email))
  };
};

// Retrieves the user with the given email address.
const findByEmail = email => coll.findOne({ email: { $eq: email } });

// Deletes secret properties from the given user object.
const sanitizeUser = user => {
  delete user.salt;
  delete user.passwordHash;
};

// Throws an Error if the given user object is invalid.
const validateUser = async user => {
  Validate.requiredProperties(user, REQUIRED_PROPERTIES);
  Validate.onlyTheseProperties(user, REQUIRED_PROPERTIES);
  Validate.string(user, 'email');
  // TODO Validate that it's a valid email address
  Validate.string(user, 'name');
  Validate.array(user, 'roles', ROLES);
  Validate.string(user, 'password');
  // TODO Validate password strength

  if (await findByEmail(user.email)) {
    error400(`User already exists: ${user.email}`);
  }
};

// Generates a new random hex string that can be used as a salt value.
const generateSalt = () => crypto.randomBytes(16).toString('hex');

// Hashes the given password using the indicated salt.
const hashPassword = (password, salt) => crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
