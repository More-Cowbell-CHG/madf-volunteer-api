const Validate = require('../validate.util');
const MongoUtil = require('./util');

const STATUSES = [ 'pending', 'open', 'closed', 'archived' ];
const STATUS_TRANSITIONS = {
  'pending': [ 'open' ],
  'open': [ 'closed', 'archived' ],
  'closed': [ 'archived' ]
};
const OFFICE_CODES = require('../offices.data').map(office => office.code);

const REQUIRED_PROPERTIES_CREATE = [
  'title', 'description', 'office', 'location', 'deadline', 'slots'
];
const ALLOWED_PROPERTIES_CREATE = [ ...REQUIRED_PROPERTIES_CREATE, 'waiver' ];
const REQUIRED_PROPERTIES_UPDATE = [ '_id' ];
const ALLOWED_PROPERTIES_UPDATE = [ '_id', ...ALLOWED_PROPERTIES_CREATE ];
const SLOT_REQUIRED_PROPERTIES = [ 'start', 'limit' ];
const SLOT_ALLOWED_PROPERTIES = [ ...SLOT_REQUIRED_PROPERTIES, 'volunteers' ]
const VOLUNTEER_PROPERTIES = [ 'id', 'name' ];
const FIND_PROJECTION = { title: 1, office: 1, location: 1, status: 1, slots: 1 };

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
      obj = { ...obj };
      validateOpportunityCreate(obj);

      if (typeof userId !== 'string') {
        Validate.error400('Must specify user ID');
        // TODO Make sure it's an actual champion?
      }

      const now = Date.now();
      obj.created = { user: userId, time: now };
      obj.lastModified = { user: userId, time: now };
      obj.status = 'pending';
      obj.slots.forEach(slot => {
        slot.volunteers = [];
      });
      collection.insertOne(obj);
      return api.get(obj._id);
    },

    // Lists opportunities. The filter argument can contain the following properties (all optional):
    // q: A query string
    // office: An office code
    // status: A status type
    list: (filter = {}) => {
      return MongoUtil.find(
        collection,
        buildQuery(filter),
        FIND_PROJECTION,
        opportunity => {
          opportunity.neededVolunteers = computeNeededVolunteers(opportunity.slots);
          delete opportunity.slots;
          return opportunity;
        }
      );
    },

    // Returns the opportunity with the given ID.
    get: id => MongoUtil.findById(collection, id),

    // Updates an opportunity.
    update: async (update, userId) => {
      validateOpportunityUpdate(update);

      if (typeof userId !== 'string') {
        Validate.error400('Must specify user ID');
        // TODO Make sure it's an actual champion?
      }

      const id = MongoUtil.id(update._id);
      delete update._id;
      const q = { _id: { $eq: id }};
      const opportunity = await collection.findOne(q);

      if (opportunity === null) {
        Validate.error400(`Opportunity does not exist: ${id.toString()}`);
      }

      update.lastModified = { user: userId, time: Date.now() };
      await collection.updateOne(q, { $set: update });
      return api.get(id);
    },

    // Changes the status of an opportunity.
    setStatus: async (id, status, userId) => {
      if (typeof id !== 'string') {
        Validate.error400(`Opportunity ID must be a string; this isn't: ${id}`);
      }

      if (typeof userId !== 'string') {
        Validate.error400('Must specify user ID');
        // TODO Make sure it's an actual champion/admin?
      }

      if (!STATUSES.includes(status)) {
        Validate.error400(`Invalid status: ${status}`);
      }

      const q = { _id: { $eq: MongoUtil.id(id) }};
      const opportunity = await collection.findOne(q);

      if (opportunity === null) {
        Validate.error400(`Opportunity does not exist: ${id.toString()}`);
      }

      const legalTransitions = STATUS_TRANSITIONS[opportunity.status];

      if (!legalTransitions.includes(status)) {
        Validate.error400(`Illegal status transition: ${opportunity.status} => ${status}`);
      }

      await collection.updateOne(q, { $set: {
        status,
        lastModified: { user: userId, time: Date.now() }
      }});
    },

    // Deletes the given user record, or the record with the given ID
    delete: async objOrId => {
      const id = typeof objOrId === 'object' && objOrId !== null ? objOrId._id : objOrId;

      if (typeof id !== 'string') {
        Validate.error400(`Opportunity ID must be a string; this isn't: ${id}`);
        return;
      }

      const q = { _id: { $eq: MongoUtil.id(id) }};
      const opportunity = await collection.findOne(q);

      if (opportunity === null) {
        Validate.error400(`Opportunity does not exist: ${id.toString()}`);
        return;
      }

      if (opportunity.status !== 'pending') {
        Validate.error400('Cannot delete an opportunity that is no longer pending; archive it instead');
        return;
      }

      MongoUtil.deleteOne(collection, objOrId)
    }
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

const validateOpportunityCreate = opportunity => {
  Validate.requiredProperties(opportunity, REQUIRED_PROPERTIES_CREATE);
  Validate.onlyTheseProperties(opportunity, ALLOWED_PROPERTIES_CREATE);
  validateOpportunityCommon(opportunity);
};

const validateOpportunityUpdate = opportunity => {
  Validate.requiredProperties(opportunity, REQUIRED_PROPERTIES_UPDATE);
  Validate.onlyTheseProperties(opportunity, ALLOWED_PROPERTIES_UPDATE);
  validateOpportunityCommon(opportunity);
};

const validateOpportunityCommon = opportunity => {
  Validate.string(opportunity, 'title');
  Validate.string(opportunity, 'description');
  Validate.string(opportunity, 'office', OFFICE_CODES);
  Validate.object(opportunity, 'location');

  if ('location' in opportunity) {
    Validate.string(opportunity.location, 'name');
    Validate.string(opportunity.location, 'address');
  }

  Validate.number(opportunity, 'deadline');
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
  Validate.onlyTheseProperties(slot, SLOT_ALLOWED_PROPERTIES);
  Validate.number(slot, 'start');
  // TODO Slot starts must be in the future
  // TODO Slot starts must be after opportunity deadline?
  Validate.number(slot, 'limit', 1);
  Validate.array(slot, 'volunteers');
  const volunteers = slot.volunteers;

  if (volunteers) {
    volunteers.forEach(validateVolunteer);
  }
};

const validateVolunteer = volunteer => {
  Validate.requiredProperties(volunteer, VOLUNTEER_PROPERTIES);
  Validate.onlyTheseProperties(volunteer, VOLUNTEER_PROPERTIES);
  Validate.string(volunteer, 'id');
  // TODO Validate that ID belongs to real volunteer?
  Validate.string(volunteer, 'name');
};

// Returns the number of volunteers still needed for an opportunity.
const computeNeededVolunteers = slots => {
  return slots.reduce((sum, slot) => {
    return sum + Math.max(slot.limit - slot.volunteers.length, 0);
  }, 0);
};
