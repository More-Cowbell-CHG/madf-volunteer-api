// Sends an error message to the client. If an Error argument is provided, it will be checked for a\
// statusCode property; if one exists and it is a number, that status code will be used. If not, it
// will use the statusCode argument to the sendError() function, or 500 if it is not specified.
exports.sendError = (res, msg = 'An unexpected error occurred', error, statusCode = 500) => {
  if (error instanceof Error) {
    if (typeof error.statusCode === 'number') {
      statusCode = error.statusCode;
    }

    global.common.error(error);
    msg = (msg ? msg + ': ' : '') + error.message;
  }

  res.status(statusCode).send({ msg });
};

// Sends an HTTP 501 "Not implemented" error to the client.
exports.notImplemented = (req, res, next) => {
  res.status(501).send({ error: 'Not implemented '});
};

exports.forbidden = (req, res, next) => {
  res.status(403).send();
};

exports.noContent = (req, res, next) => {
  res.status(204).send();
};