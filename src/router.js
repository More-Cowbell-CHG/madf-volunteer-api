const passport = require('./passport-init');
const AuthController = require('./routes/auth.controller');
const OfficeController = require('./routes/office.controller');
const OpportunityController = require('./routes/opportunity.controller');
const SignupController = require('./routes/signup.controller');
const UserController = require('./routes/user.controller');

module.exports = express => {
  const router = express.Router();
  router.post('/login', AuthController.authenticate);
  router.get('/office', auth(), OfficeController.list);
  router.get('/opportunity', auth(), OpportunityController.list);
  router.get('/opportunity/:id', auth(), OpportunityController.getById);
  router.post('/opportunity', auth(), OpportunityController.create);
  router.put('/opportunity', auth(), OpportunityController.update);
  router.put('/opportunity/:id/set-state', auth(), OpportunityController.setState);
  router.delete('/opportunity/:id', auth(), OpportunityController.delete);
  router.post('/opportunity/:id/signup', auth(), SignupController.create);
  router.delete('/opportunity/:id/signup/:start', auth(), SignupController.delete);
  router.get('/user', auth(), UserController.list);
  router.get('/user/:id', auth(), UserController.get);
  router.post('/user', UserController.create);
  router.put('/user/:id', auth(), UserController.update);
  router.delete('/user/:id', auth(), UserController.delete);
  return router;
};

const auth = () => passport.authenticate('jwt', { session: false });
