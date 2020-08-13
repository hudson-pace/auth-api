function errorHandler(err, req, res, next) {
  if (err.name === 'ValidationError') {
    return res.status(422).json(err.message);
  } if (err.name === 'AuthenticationError') {
    return res.status(401).json(err.message);
  } if (err.name === 'NotFoundError') {
    return res.status(404).json(err.message);
  }
  return res.status(500).json(err.message);
}

module.exports = errorHandler;
