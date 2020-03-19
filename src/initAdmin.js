const prompts = require('prompts');

const questions = [
  {
    type: 'text',
    name: 'name',
    message: 'Name'
  },
  {
    type: 'text',
    name: 'email',
    message: 'Email address'
  },
  {
    type: 'password',
    name: 'password',
    message: 'Password'
  }
];

(async () => {
  const user = await prompts(questions);
  user.roles = [ 'volunteer', 'champion', 'admin' ];
  require('dotenv').config();
  const config = {
    host: process.env.mongo_host,
    username: process.env.mongo_username,
    password: process.env.mongo_password,
    dbName: process.env.mongo_dbName || 'madf-volunteer'
  };
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
