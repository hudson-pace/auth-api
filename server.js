const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const http = require('http');
const https = require('https');

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
const httpServer = http.createServer(app);
let httpsServer;
if (config.environment === 'production') {
  const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/hudsonotron.com/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/hudsonotron.com/fullchain.pem'),
  };
  httpsServer = https.createServer(options, app);
}

app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));
app.use('/', authController);
app.use(errorHandler);

httpServer.listen(8000);
httpsServer.listen(8001);
