const Http = require('./http.util');

exports.create = (req, res) => {
  res.send({ endpoint: 'create signup', success: true });
};

exports.delete = (req, res) => {
  res.send({ endpoint: 'delete signup', success: true });
};
