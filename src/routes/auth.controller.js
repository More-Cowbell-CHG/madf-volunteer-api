// Authentication controller
const jwt = require('jsonwebtoken');
const passport = require('passport');
const httpUtil = require('./http.util');

exports.authenticate = async (req, res, next) => {
  passport.authenticate('login', { session: false }, (error, user, info) => {
    if (error) {
      httpUtil.sendError(error);
      throwError(res, 'An error occurred while trying to authenticate', error);
      return;
    }

    if (!user) {
      throwError(res, 'Authentication failed', null, 403);
      return;
    }

    req.login(user, { session: false }, err => {
      if (err) {
        throwError(res, 'An error occurred while trying to authenticate', err);
        return;
      }

      const token = jwt.sign({ user }, global.common.config.get('passport.jwtSecret'));
      res.send({ user, token });
    });
  })(req, res, next);
};
