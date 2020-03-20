const Http = require('./http.util');

exports.list = async (req, res) => {
  if (!req.user.roles.includes('admin') && !req.user.roles.includes('champion') && req.query.status) {
    delete req.query.status;
  }
  res.send({opportunities: global.db.opportunity.list()});
};

exports.getById = (req, res) => {
  res.send({endpoint: 'geById', success: true});
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

exports.update = (req, res) => {
  res.send({endpoint: 'update', success: true});
};

exports.setState = (req, res) => {
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
