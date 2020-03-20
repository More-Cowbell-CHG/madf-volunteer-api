// Tests for the user controller
const controller = require('./user.controller');
const users = require('../users.data');
const mockCreateUser = {
  name: 'Darth Vader',
  email: 'darthvader@fake.com',
  password: 'password123'
};
const mockUser = {
  _id: '5e751194fdf8dde491c2b271',
  roles: ['volunteer'],
  ...mockCreateUser
};
const mockUpdateUser = {
  ...mockUser,
  name: 'Anakin Skywalker'
};

describe('UserController', () => {

  beforeAll(() => {
    global.db = {
      user: {
        list: jest.fn(() => users),
        create: jest.fn(() => mockUser),
        update: jest.fn(() => mockUpdateUser),
        delete: jest.fn(),
        findByEmail: jest.fn(() => mockUser)
      }
    };
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
          expect(body.users).toHaveLength(2);
          done();
        }
      };
      await controller.list(req, res)
    });
  });

  describe('UserController.create', () => {
    it('should create user', async done => {
      const req = {
        body: mockCreateUser
      };
      const res = {
        send: body => {
          expect(body._id).toBe(mockUser._id);
          expect(body.name).toBe(mockUser.name);
          expect(body.email).toBe(mockUser.email);
          expect(body.roles).toHaveLength(1);
          expect(body.roles[0]).toBe('volunteer');
          done();
        },
        status: code => res
      };
      await controller.create(req, res);
    });
  });

  describe('UserController.update', () => {
    it('should update user', async done => {
      let user = await global.db.user.findByEmail(mockUser.email);
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
      let user = await global.db.user.findByEmail(mockUser.email);
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
