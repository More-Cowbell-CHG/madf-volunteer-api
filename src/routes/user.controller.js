const Http = require('./http.util');

exports.list = async (req, res) => {
  if (!req.user.roles.includes('admin')) {
    return Http.forbidden(req, res);
  }

  res.send({users: await global.db.user.list()});
};

exports.get = async (req, res) => {
  res.send(await global.db.user.get(req.params.id));
};

exports.create = async (req, res) => {
  let user = {...req.body};
  user.roles = ['volunteer'];

  try {
    user = await global.db.user.create(user);
  } catch (err) {
    return res.status(400).send({error: err.message});
  }

  res.send(user);
};

exports.update = async (req, res) => {
  let user = {...req.body, _id: req.params.id};

  try {
    user = await global.db.user.update(user);
  } catch (err) {
    return res.status(400).send({error: err.message});
  }

  res.send(user);
};

exports.delete = async (req, res) => {
  await global.db.user.delete(req.params.id);
  return Http.noContent(req, res);
};
