const crypto = require('crypto');

module.exports = db => {
  const coll = db.collection('user');
  const api = {
    // Creates a new user
    create: async user => {
      if ('_id' in user) {
        throw Error('Can\'t create a user with an _id');
      }

      if (await api.findByEmail(user.email)) {
        throw Error(`User already exists: ${user.email}`);
      }

      // TODO Validate the user!

      user.salt = generateSalt();
      user.passwordHash = hashPassword(user.password, user.salt);
      delete user.password;
      await coll.insertOne(user);
      return user;
    },
    // Returns the user with the given email address if their password is correct. Returns null if
    // no such user exists or the password is wrong.
    authenticate: async (email, password) => {
      let user = await api.findByEmail(email);

      if (!user) {
        return null;
      }

      const hash = hashPassword(password, user.salt);

      if (hash !== user.passwordHash) {
        return null;
      }

      user = { ...user };
      delete user.salt;
      delete user.passwordHash;
      return user;
    },
    findByEmail: email => {
      return coll.findOne({ email: { $eq: email } });
    }
  };
  return api;
};

const generateSalt = () => crypto.randomBytes(16).toString('hex');

const hashPassword = (password, salt) => crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
