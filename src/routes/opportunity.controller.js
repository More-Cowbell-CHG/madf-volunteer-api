const Http = require('./http.util');

const OPPORTUNITIES = [
  {_id: "1", title: "op1", office: "MIDV", location: {}, status: "open", openSlots: 5},
  {_id: "2", title: "op2", office: "BOCA", location: {}, status: "open", openSlots: 5},
  {_id: "3", title: "op3", office: "DRAP", location: {}, status: "open", openSlots: 5},
  {_id: "4", title: "op4", office: "DURH", location: {}, status: "open", openSlots: 5},
  {_id: "5", title: "op5", office: "EDMO", location: {}, status: "open", openSlots: 5},
];

exports.list = async (req, res) => {
  res.send({ opportunities: OPPORTUNITIES });
};

exports.getById = (req, res) => {
  res.send({ endpoint: 'geById', success: true });
};

exports.create = (req, res) => {
  res.send({ endpoint: 'create', success: true });
};

exports.update = (req, res) => {
  res.send({ endpoint: 'update', success: true });
};

exports.setState = (req, res) => {
  res.send({ endpoint: 'setState', success: true });
};

exports.delete = (req, res) => {
  res.send({ endpoint: 'delete', success: true });
};
