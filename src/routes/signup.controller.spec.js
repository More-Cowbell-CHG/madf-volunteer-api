// Tests for the signup controller
const controller = require('./signup.controller');

describe('SignupController', () => {

  describe('SignupController.getById', () => {
    it('should create signup', done => {
      const res = {};
      res.send = body => {
        done();
      };
      controller.create(null, res);
    });
  });

  describe('SignupController.delete', () => {
    it('should delete signup', done => {
      const res = {};
      res.send = body => {
        done();
      };
      controller.delete(null, res);
    });
  });
});
