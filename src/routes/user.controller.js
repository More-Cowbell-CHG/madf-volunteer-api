const Http = require('./http.util');

exports.list = (req, res) => {
  res.send({ endpoint: 'list', success: true });
};

exports.create = (req, res) => {
  res.send({ endpoint: 'create', success: true });
};

exports.update = (req, res) => {
  res.send({ endpoint: 'update', success: true });
};

exports.delete = (req, res) => {
  res.send({ endpoint: 'delete', success: true });
};

