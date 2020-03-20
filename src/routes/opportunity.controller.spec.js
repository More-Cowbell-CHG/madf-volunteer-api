// Tests for the opportunity controller
const controller = require('./opportunity.controller');

const opportunities = [
  {
    _id: '5e75399fdbfd482e16c73126',
    title: 'cool opportunity',
    office: 'MIDV',
    location: {
      name: 'CHG Headquarters',
      address: '7259 Bingham Junction Blvd, Midvale, UT 84047'
    },
    status: 'open',
    neededVolunteers: 5
  },
  {
    _id: '5e754136c0d97544056f4e37',
    title: 'cool opportunity',
    office: 'MIDV',
    location: {
      name: 'CHG Headquarters - SLC',
      address: '7259 Bingham Junction Blvd, Midvale, UT 84047'
    },
    status: 'open',
    neededVolunteers: 5
  }
];
const createOpp = {
  title: 'cool opportunity',
  description: 'opportunity to do cool things #2',
  office: 'MIDV',
  location: {
    name: 'CHG Headquarters',
    address: '7259 Bingham Junction Blvd, Midvale, UT 84047'
  },
  deadline: 1584735055833,
  slots: [
    {
      start: 1584735055833,
      limit: 5,
      volunteers: []
    }
  ]
};
const updateOpp = {...createOpp, title: 'updated title'};

describe('OpportunityController', () => {

  beforeAll(() => {
    global.db = {
      opportunity: {
        create: jest.fn(() => createOpp),
        list: jest.fn(() => opportunities),
        get: jest.fn(() => opportunities[0]),
        update: jest.fn(() => updateOpp),
        setStatus: jest.fn(),
        delete: jest.fn()
      }
    };
  });

  describe('OpportunityController.list', () => {
    it('should return something', done => {
      const req = {
        user: {
          roles: ['admin']
        }
      };
      const res = {};
      res.send = body => {
        expect(body.opportunities).toHaveLength(2);
        body.opportunities.forEach(opportunity => {
          let exp = expect(opportunity);
          exp.toHaveProperty('_id');
          exp.toHaveProperty('title');
          exp.toHaveProperty('office');
          exp.toHaveProperty('location');
          exp.toHaveProperty('status');
          expect(typeof opportunity._id).toEqual('string');
          expect(typeof opportunity.title).toEqual('string');
          expect(typeof opportunity.office).toEqual('string');
          expect(typeof opportunity.location).toEqual('object');
          expect(typeof opportunity.status).toEqual('string');
        });
        done();
      };
      controller.list(req, res);
    });
  });

  describe('OpportunityController.getById', () => {
    it('should get by id', done => {
      const req = {
        params: {
          id: '5e75399fdbfd482e16c73126'
        }
      };
      const res = {
        send: body => {
          expect(body.title).toBe('cool opportunity');
          done();
        },
        status: code => res
      };
      controller.getById(req, res);
    });
  });

  describe('OpportunityController.create', () => {
    it('should create', done => {
      const req = {
        body: createOpp,
        user: {
          _id: '5e73cec83fdfdb3527b2a7ee'
        }
      };
      const res = {
        send: body => {
          expect(body.title).toBe('cool opportunity');
          done();
        },
        status: code => res
      };
      controller.create(req, res);
    });
  });

  describe('OpportunityController.update', () => {
    it('should update', done => {
      const req = {
        body: updateOpp,
        user: {
          _id: '5e73cec83fdfdb3527b2a7ee',
          roles: ['champion']
        },
        params: {
          id: '5e754136c0d97544056f4e37'
        }
      };
      const res = {
        send: body => {
          expect(body.title).toBe('updated title');
          done();
        },
        status: code => res
      };
      controller.update(req, res);
    });
  });

  describe('OpportunityController.setState', () => {
    it('should set state', done => {
      const req = {
        body: {
          status: 'open'
        },
        params: {
          id: '5e754136c0d97544056f4e37'
        },
        user: {
          roles: ['admin']
        }
      };
      const res = {
        send: body => {
          done();
        },
        status: code => res
      };
      controller.setState(req, res);
    });
  });

  describe('OpportunityController.delete', () => {
    it('should delete', done => {
      const res = {
        send: body => {
          done();
        },
        status: code => res
      };
      controller.delete(null, res);
    });
  });
});







