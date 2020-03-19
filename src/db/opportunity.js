const STATUSES = [ 'pending', 'open', 'closed', 'archived' ];

module.exports = db => {
  const coll = db.collection('opportunity');
  return {
    // Lists opportunities. The filter argument can contain the following properties (all optional):
    // q: A query string
    // office: An office code
    // status: A status type (defaults to 'open'; explicitly pass 'null' to get all types)
    list: (filter = {}) => {
      filter = {
        status: 'open',
        ...filter
      };
      return coll.find(buildQuery(filter));
    }
  };
};

const buildQuery = filter => {
  const query = {};
  buildQuery_q(filter, query);
  buildQuery_office(filter, query);
  buildQuery_status(filter, query);
  return query;
};

const buildQuery_q = (filter, query) => {
  const q = stringFilterProp(filter, 'q');

  if (!q) {
    return;
  }

  query.title = { $regex: searchStringToRegExp(q) };
};

const buildQuery_office = (filter, query) => {
  const office = stringFilterProp(filter, 'office');

  if (!office) {
    return;
  }

  query.office = { $eq: filter.office };
};

const buildQuery_status = (filter, query) => {
  const status = stringFilterProp(filter, 'status');

  if (!status) {
    return;
  }

  if (!STATUSES.includes(status)) {
    throw Error(`Invalid status: ${filter.status}`);
  }

  query.status = { $eq: filter.status };
};

const stringFilterProp = (filter, key) => {
  const value = filter[key];

  if (!filter[key]) {
    return null;
  }

  if (typeof value !== 'string') {
    throw Error(`Not a string: ${key}=${value}`);
  }

  return value.trim();
};

// Converts the given search string to a RegExp.
const searchStringToRegExp = string => {
  return new RegExp(string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
};
