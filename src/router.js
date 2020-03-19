const passport = require('./passport-init');
const AuthController = require('./routes/auth.controller');
const OfficeController = require('./routes/office.controller');

module.exports = express => {
  const router = express.Router();
  router.post('/login', AuthController.authenticate);
  router.get('/office', auth(), OfficeController.list);
  return router;
};

const auth = () => passport.authenticate('jwt', { session: false });
