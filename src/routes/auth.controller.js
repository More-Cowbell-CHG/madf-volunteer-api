// Authentication controller
const jwt = require('jsonwebtoken');
const passport = require('passport');

module.exports = {
  authenticate: async (req, res, next) => {
    passport.authenticate('login', { session: false }, (error, user, info) => {
      if (error) {
        global.common.error(error);
        throwError(res, 'An error occurred while trying to authenticate', 500);
        return;
      }

      if (!user) {
        throwError(res, 'Authentication failed', 403);
        return;
      }

      req.login(user, { session: false }, err => {
        if (err) {
          throwError(res, err, 400);
          return;
        }

        const token = jwt.sign({ user }, global.common.config.get('passport.jwtSecret'));
        res.send({ user, token });
      });
    })(req, res, next);
  }
};

const throwError = (res, msg, code = 400) => {
  res.status(code).send({ msg });
};
