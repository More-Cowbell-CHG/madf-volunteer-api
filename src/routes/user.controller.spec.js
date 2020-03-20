// Tests for the signup controller
const controller = require('./user.controller');
const DEFAULT_CONFIG = {};
const config = require('../common/config')(DEFAULT_CONFIG).toObject('mongo');
const email = 'darthvader@testemail.com';

describe('UserController', () => {

  beforeAll(async () => {
    global.db = await require('../db/db')(config);
  });

  afterAll(() => {
    global.db.close();
  });

  describe('UserController.list', () => {
    it('should list users', async done => {
      const req = {
        user: {
          roles: ['admin']
        }
      };
      const res = {
        send: body => {
          expect(body.users).toBeTruthy();
          done();
        }
      };
      await controller.list(req, res)
    });
  });

  describe('UserController.create', () => {
    it('should create user', async done => {
      const req = {
        body: {
          name: 'Darth Vader',
          email: 'darthvader@testemail.com',
          password: 'password123'
        }
      };
      const res = {
        send: body => {
          expect(body._id).toBeTruthy();
          expect(body.name).toBe('Darth Vader');
          expect(body.email).toBe(email);
          done();
        },
        status: code => res
      };
      await controller.create(req, res);
    });
  });

  describe('UserController.update', () => {
    it('should update user', async done => {
      let user = await global.db.user.findByEmail(email);
      const req = {
        params: {
          id: user._id
        },
        body: {
          name: 'Anakin Skywalker',
          email: 'darthvader@testemail.com',
        }
      };
      const res = {
        send: body => {
          expect(body.name).toBe('Anakin Skywalker');
          done();
        },
        status: code => res
      };
      await controller.update(req, res);
    });
  });

  describe('UserController.delete', () => {
    it('should delete user', async done => {
      let user = await global.db.user.findByEmail(email);
      const req = {
        params: {
          id: user._id
        }
      };
      const res = {
        send: res => {
          done();
        },
        status: code => res
      };
      await controller.delete(req, res);
    });
  });
});
