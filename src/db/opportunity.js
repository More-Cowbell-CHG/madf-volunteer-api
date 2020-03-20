const Validate = require('../validate.util');
const MongoUtil = require('./util');

const STATUSES = [ 'pending', 'open', 'closed', 'archived' ];
const OFFICE_CODES = require('../offices.data').map(office => office.code);

const REQUIRED_PROPERTIES_CREATE = [
  'title', 'description', 'office', 'location', 'deadline', 'slots'
];
const ALLOWED_PROPERTIES_CREATE = [
  ...REQUIRED_PROPERTIES_CREATE, 'waiver'
];
const SLOT_REQUIRED_PROPERTIES = [ 'start', 'limit' ];
const FIND_PROJECTION = { title: 1, office: 1, location: 1, status: 1, slots: 1 };

/*
{
  "_id": ObjectID,
  "created": {
    "user": ObjectID,
    "time": <long>
  },
  "lastModified": {
    "user": ObjectID,
    "time": <long>
  },
  "title": "Donate Blood",
  "description": "Visit the vampires",
  "office": "SLC",
  "location": {
    "name": "CHG Headquarters",
    "address": "123 Blood Drive, City, ST 87245"
  },
  "status": "open",
  "deadline": <long>,
  "waiver": "You have to agree to this",
  "slots": [
    {
      "start": <long>,
      "limit": 5,
      "volunteers": [
        {
          "id": ObjectID,
          "name": "Robert J. Walker"
        },
        ...
      ]
    }
  ]
}
*/

module.exports = db => {
  const collection = db.collection('opportunity');
  const api = {
    // Creates a new opportunity. Properties:
    // - title:string
    // - description:string
    // - office:string
    // - location.name:string
    // - location.address:string
    // - deadline:number
    // - waiver:string (optional)
    // - slots:array<object>
    //   - start:number
    //   - limit:number
    create: async (obj, userId) => {
      validateOpportunity(obj);
      const now = Date.now();
      obj.created = { user: userId, time: now };
      obj.lastModified = { user: userId, time: now };
      obj.status = 'pending';
      obj.slots.forEach(slot => {
        slot.volunteers = [];
      });
      await collection.insertOne(obj);
      return MongoUtil.convertObjectIds(obj);
    },
    // Lists opportunities. The filter argument can contain the following properties (all optional):
    // q: A query string
    // office: An office code
    // status: A status type (defaults to 'open'; explicitly pass 'null' to get all types)
    list: (filter = {}) => {
      return MongoUtil.find(
        collection,
        buildQuery({ status: 'open', ...filter }),
        FIND_PROJECTION,
        opportunity => {
          opportunity.neededVolunteers = computeNeededVolunteers(opportunity.slots);
          delete opportunity.slots;
          return opportunity;
        }
      );
    },

    // Deletes the given user record, or the record with the given ID
    delete: objOrId => MongoUtil.deleteOne(collection, objOrId)
  };
  return api;
};

// Builds the find query object based on the filter object.
const buildQuery = filter => {
  const query = {};
  buildQuery_q(filter, query);
  buildQuery_office(filter, query);
  buildQuery_status(filter, query);
  return query;
};

// Builds the query string part of the query object.
const buildQuery_q = (filter, query) => {
  const q = stringFilterProp(filter, 'q');

  if (!q) {
    return;
  }

  query.title = { $regex: searchStringToRegExp(q) };
};

// Builds the office filter part of the query object.
const buildQuery_office = (filter, query) => {
  const office = stringFilterProp(filter, 'office');

  if (!office) {
    return;
  }

  query.office = { $eq: filter.office };
};

// Builds the status filter part of the query object.
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

// Returns the value of the named property on the given filter. If it is falsy or a string
// containing only whitespace, it returns null. If it's not a string and not falsy, it throws an
// Error.
const stringFilterProp = (filter, key) => {
  const value = filter[key];

  if (!value) {
    return null;
  }

  if (typeof value !== 'string') {
    throw Error(`Not a string: ${key}=${value}`);
  }

  return value.trim() || null;
};

// Converts the given search string to a RegExp.
const searchStringToRegExp = string => {
  return new RegExp(string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
};

const validateOpportunity = opportunity => {
  Validate.requiredProperties(opportunity, REQUIRED_PROPERTIES_CREATE);
  Validate.onlyTheseProperties(opportunity, ALLOWED_PROPERTIES_CREATE);
  Validate.string(opportunity, 'title');
  Validate.string(opportunity, 'description');
  Validate.string(opportunity, 'office', OFFICE_CODES);
  Validate.object(opportunity, 'location');
  Validate.string(opportunity.location, 'name');
  Validate.string(opportunity.location, 'address');
  Validate.number(opportunity.deadline);
  // TODO Require deadline to be in the future
  Validate.string(opportunity, 'waiver');
  Validate.array(opportunity, 'slots');
  const slots = opportunity.slots;

  if (slots) {
    slots.forEach(validateSlot);
  }
};

const validateSlot = slot => {
  Validate.requiredProperties(slot, SLOT_REQUIRED_PROPERTIES);
  Validate.onlyTheseProperties(opportunity, SLOT_REQUIRED_PROPERTIES);
  Validate.number(opportunity, 'start');
  // TODO Slot starts must be in the future
  // TODO Slot starts must be after opportunity deadline?
  Validate.number(opportunity, limit, 1);
};

// Returns the number of volunteers still needed for an opportunity.
const computeNeededVolunteers = slots => {
  return slots.reduce((sum, slot) => {
    sum += slot.limit - slot.volunteers.length;
  }, 0);
};
