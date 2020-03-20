const Http = require('./http.util');

exports.list = async (req, res) => {
  if (!req.user.roles.includes('admin') && !req.user.roles.includes('champion') && req.query.status) {
    delete req.query.status;
  }
  res.send({opportunities: global.db.opportunity.list()});
};

exports.getById = async (req, res) => {
  try {
    res.send(await global.db.opportunity.get(req.params.id));
  } catch (err) {
    res.status(400).send({error: err.message});
  }
};

exports.create = async (req, res) => {
  let opportunity = {...req.body};
  try {
    opportunity = await global.db.opportunity.create(opportunity);
  } catch (err) {
    return res.status(err.statusCode).send({error: err.message});
  }
  res.send(opportunity);
};

exports.update = async (req, res) => {
  let opportunity = {...req.body, _id: req.params.id};

  try {
    opportunity = await global.db.opportunity.update(opportunity);
  } catch (err) {
    return res.status(400).send({error: err.message});
  }

  res.send(opportunity);
};

exports.setState = (req, res) => {
  const id = req.params.id;

  res.send({endpoint: 'setState', success: true});
};

exports.delete = async (req, res) => {
  try {
    await global.db.opportunity.delete(req.params.id);
  } catch (err) {
    return res.status(400).send({error: err.message});
  }
  return Http.noContent(req, res);
};
