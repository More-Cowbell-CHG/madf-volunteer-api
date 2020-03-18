module.exports = express => {
  const router = express.Router();
  router.get('/hello', require('./routes/hello.controller'));
  return router;
};
