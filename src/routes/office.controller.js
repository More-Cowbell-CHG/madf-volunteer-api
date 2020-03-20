const OFFICES = require('../offices.data');

exports.list = (req, res, next) => {
  res.send({ offices: OFFICES });
};
