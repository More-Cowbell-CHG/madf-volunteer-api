// Tests for the opportunity controller
const controller = require('./opportunity.controller');

describe('OpportunityController', () => {

  describe('OpportunityController.list', () => {
    it('should return something', done => {
      const res = {};
      res.send = body => {
        expect(body.opportunities).toHaveLength(5);
        body.opportunities.forEach(opportunity => {
          let exp = expect(opportunity);
          exp.toHaveProperty('_id');
          exp.toHaveProperty('title');
          exp.toHaveProperty('office');
          exp.toHaveProperty('location');
          exp.toHaveProperty('status');
          exp.toHaveProperty('openSlots');
          expect(typeof opportunity._id).toEqual('string');
          expect(typeof opportunity.title).toEqual('string');
          expect(typeof opportunity.office).toEqual('string');
          expect(typeof opportunity.location).toEqual('object');
          expect(typeof opportunity.status).toEqual('string');
          expect(typeof opportunity.openSlots).toEqual('number');
        });
        done();
      };
      controller.list(null, res);
    });
  });

  describe('OpportunityController.getById', () => {
    it('should get by id', done => {
      const res = {};
      res.send = body => {
        done();
      };
      controller.getById(null, res);
    });
  });

  describe('OpportunityController.create', () => {
    it('should create', done => {
      const res = {};
      res.send = body => {
        done();
      };
      controller.create(null, res);
    });
  });

  describe('OpportunityController.update', () => {
    it('should update', done => {
      const res = {};
      res.send = body => {
        done();
      };
      controller.update(null, res);
    });
  });

  describe('OpportunityController.setState', () => {
    it('should set state', done => {
      const res = {};
      res.send = body => {
        done();
      };
      controller.setState(null, res);
    });
  });

  describe('OpportunityController.delete', () => {
    it('should delete', done => {
      const res = {};
      res.send = body => {
        done();
      };
      controller.delete(null, res);
    });
  });
});







