const MongoClient = require('mongodb').MongoClient;

module.exports = config => {
  return new Promise((resolve, reject) => {
    const username = encodeURIComponent(config.username);
    const password = encodeURIComponent(config.password);
    const url = `mongodb://${username}:${password}@${config.host}/${config.dbName}`;
    const client = new MongoClient(url);
    client.connect(err => {
      if (err) {
        reject(err);
        return;
      }

      const db = client.db(config.dbName);
      resolve(buildApi(client, db));
    });
  });
};

const buildApi = (client, db) => {
  const api = {
    user: require('./user')(db),
    close: async () => {
      await client.close();
    }
  };
  return api;
};