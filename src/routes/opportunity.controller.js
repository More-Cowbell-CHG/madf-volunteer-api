const Http = require('./http.util');

exports.list = async (req, res) => {
  if (!req.user.roles.includes('admin') && !req.user.roles.includes('champion') && req.query.status) {
    delete req.query.status;
  }
  let opportunities = await global.db.opportunity.list();
  res.send({opportunities: opportunities});
};

exports.getById = async (req, res) => {
  try {
    res.send(await global.db.opportunity.get(req.params.id));
  } catch (err) {
    res.status(400).send({error: err.message});
  }
};

exports.create = async (req, res) => {
  if (!req.user.roles.includes('champion')) {
    return Http.forbidden(req, res);
  }

  let opportunity = {...req.body};
  try {
    opportunity = await global.db.opportunity.create(opportunity, req.user._id);
  } catch (err) {
    return res.status(err.statusCode).send({error: err.message});
  }
  res.send(opportunity);
};

exports.update = async (req, res) => {
  if (!req.user.roles.includes('champion')) {
    return Http.forbidden(req, res);
  }

  let opportunity = {...req.body, _id: req.params.id};

  try {
    opportunity = await global.db.opportunity.update(opportunity, req.user._id);
  } catch (err) {
    return res.status(400).send({error: err.message});
  }

  res.send(opportunity);
};

exports.setState = async (req, res) => {
  if (!req.user.roles.includes('admin')) {
    return Http.forbidden(req, res);
  }

  const id = req.params.id;
  const status = req.body.status;
  try {
    await global.db.opportunity.setStatus(id, status, req.user._id);
  } catch (err) {
    return res.status(400).send({error: err.message});
  }

  return Http.noContent(req, res);
};

exports.delete = async (req, res) => {
  if (!req.user.roles.includes('champion')) {
    return Http.forbidden(req, res);
  }

  try {
    await global.db.opportunity.delete(req.params.id);
  } catch (err) {
    return res.status(400).send({error: err.message});
  }
  return Http.noContent(req, res);
};
