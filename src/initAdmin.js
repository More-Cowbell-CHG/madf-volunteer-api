// Command-line script for creating the initial application user in MongoDB.
const prompts = require('prompts');

const DEFAULT_CONFIG = {
  mongo: {
    dbName: 'madf-volunteer'
  }
};

const NAME_AND_EMAIL = [
  {
    type: 'text',
    name: 'name',
    message: 'Name'
  },
  {
    type: 'text',
    name: 'email',
    message: 'Email address'
  }
];
const PASSWORD = [
  {
    type: 'password',
    name: 'password',
    message: 'Password'
  },
  {
    type: 'password',
    name: 'confirm',
    message: 'Confirm password'
  }
];

(async () => {
  let user = await prompts(NAME_AND_EMAIL);

  do {
    user = { ...user, ...await prompts(PASSWORD)};

    if (user.password === user.confirm) {
      break;
    }

    console.log('Passwords don\'t match!');
  } while (true);

  delete user.confirm;
  user.roles = [ 'volunteer', 'champion', 'admin' ];
  const config = require('./common/config')(DEFAULT_CONFIG).toObject('mongo');
  const db = await require('./db/db')(config);

  try {
    await db.user.create(user);
    console.log(`User ${user.email} created!`);
  } catch (err) {
    console.error(err);
  } finally {
    db.close();
  }
})();
