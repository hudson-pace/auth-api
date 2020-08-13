const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const errorHandler = require('./middleware/error-handler');
const authController = require('./auth/auth.controller.js');
const config = require('./config');

const connectionOptions = {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
};
mongoose.connect(config.url, connectionOptions);
mongoose.Promise = global.Promise;

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));
app.use('/', authController);
app.use(errorHandler);
app.listen(8000);
