const passport = require('./passport-init');
const AuthController = require('./routes/auth.controller');

module.exports = express => {
  const router = express.Router();
  router.post('/login', AuthController.authenticate);
  router.get('/hello', passport.authenticate('jwt', { session: false }), require('./routes/hello.controller'));
  return router;
};
