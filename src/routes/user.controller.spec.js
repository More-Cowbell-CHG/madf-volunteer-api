// Tests for the signup controller
const controller = require('./user.controller');

describe('UserController', () => {

  describe('UserController.create', () => {
    it('should create user', done => {
      const res = {};
      res.send = body => {
        done();
      };
      controller.create(null, res);
    });
  });

  describe('UserController.delete', () => {
    it('should delete user', done => {
      const res = {};
      res.send = body => {
        done();
      };
      controller.delete(null, res);
    });
  });
});
