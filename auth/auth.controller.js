const express = require('express');
const Joi = require('@hapi/joi');
const validateRequest = require('../middleware/validate-request');
const authService = require('./auth.service');

const router = express.Router();

function setRefreshTokenCookie(res, token) {
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)),
  };
  res.cookie('refreshToken', token, cookieOptions);
}

function loginSchema(req, res, next) {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}
function login(req, res, next) {
  authService.login(req.body, req.ip)
    .then(({ refreshToken, accessToken }) => {
      setRefreshTokenCookie(res, refreshToken.token);
      res.status(201).json({ accessToken });
    })
    .catch(next);
}

function registerSchema(req, res, next) {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}
function register(req, res, next) {
  authService.register(req.body, req.ip)
    .then(({ refreshToken, accessToken }) => {
      setRefreshTokenCookie(res, refreshToken.token);
      res.status(201).json({ accessToken });
    })
    .catch(next);
}

function renewTokens(req, res, next) {
  authService.renewTokens(req.cookies.refreshToken, req.ip)
    .then(({ refreshToken, accessToken }) => {
      setRefreshTokenCookie(res, refreshToken.token);
      res.status(201).json({ accessToken });
    })
    .catch(next);
}

function revokeToken(req, res, next) {
  authService.revokeToken(req.cookies.refreshToken)
    .then((success) => res.status(200).json(success))
    .catch(next);
}

router.post('/login', loginSchema, login);
router.post('/register', registerSchema, register);
router.post('/renew-tokens', renewTokens);
router.post('/revoke-token', revokeToken);

module.exports = router;
