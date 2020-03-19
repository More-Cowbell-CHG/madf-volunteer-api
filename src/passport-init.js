const passport = require('passport');
const PassportLocal = require('passport-local');
const PassportJwt = require('passport-jwt');

passport.use('login', new PassportLocal.Strategy({
  usernameField: 'email'
}, async (email, password, callback) => {
  const user = await global.db.user.authenticate(email, password);

  if (!user) {
    return callback(null, false, { message: 'Incorrect username/password' });
  }

  return callback(null, user);
}));

passport.use(new PassportJwt.Strategy({
  jwtFromRequest: PassportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: global.common.config.get('passport.jwtSecret')
}, async (jwtPayload, callback) => {
  const user = await global.db.user.findByEmail(jwtPayload.user.email);

  if (!user) {
    return callback({ message: 'Current user not found' });
  }

  return callback(null, user);
}));

module.exports = passport;
