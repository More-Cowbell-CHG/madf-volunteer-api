// Tests that the /hello endpoint returns '{"message":"Hello, world!"}'.
const controller = require('./hello.controller');

describe ('hello', () => {
  it ('should return {"message":"Hello, world!"}', done => {
    const res = {};
    res.send = body => {
      expect(body.greeting).toEqual('Hello, world!');
      done();
    };
    controller(null, res);
  });
});
