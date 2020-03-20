// Tests that the /hello endpoint returns '{"message":"Hello, world!"}'.
const controller = require('./office.controller');

describe('OfficeController', () => {

  describe('OfficeController.list', () => {
    it('should return an array of objects, each with a code and a name', done => {
      const res = {};
      res.send = body => {
        expect(body.offices).toHaveLength(10);
        body.offices.forEach(office => {
          let exp = expect(office);
          exp.toHaveProperty('code');
          exp.toHaveProperty('name');
          expect(typeof office.code).toEqual('string');
          expect(typeof office.name).toEqual('string');
        });
        done();
      };
      controller.list(null, res);
    });
  });
});
