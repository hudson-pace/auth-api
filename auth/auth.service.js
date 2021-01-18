const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const config = require('../config');
const User = require('./user.model');
const RefreshToken = require('./refresh-token.model');

function generateRefreshToken(user, ipAddress, resource) {
  return new RefreshToken({
    user: user.id,
    token: crypto.randomBytes(40).toString('hex'),
    expires: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)),
    createdByIp: ipAddress,
    resource,
  });
}

function generateAccessToken(user, resource) {
  let secretKey = config.secret;

  switch (resource) {
    case 'spybot':
      secretKey = config.spybotKey;
      break;
    default:
      break;
  }

  return jwt.sign({
    sub: user.id,
    id: user.id,
    username: user.username,
    resource,
  }, secretKey, { expiresIn: '15m' });
}

async function login({ username, password, resource }, ipAddress) {
  const user = await User.findOne({ username });
  if (!user || !await bcrypt.compare(password, user.passwordHash)) {
    const error = new Error('Username or password is incorrect.');
    error.name = 'AuthenticationError';
    throw error;
  }
  await RefreshToken.deleteMany({ user: user.id });
  const refreshToken = generateRefreshToken(user, ipAddress, resource);
  await refreshToken.save();
  const accessToken = generateAccessToken(user, resource);
  return { refreshToken, accessToken };
}

async function register(userParams, ipAddress) {
  if (await User.findOne({ username: userParams.username })) {
    const error = new Error('Username is unavailable.');
    error.name = 'VerificationError';
    throw error;
  }

  const user = new User();
  user.username = userParams.username;
  user.passwordHash = await bcrypt.hash(userParams.password, 10);
  await user.save();

  const refreshToken = generateRefreshToken(user, ipAddress);
  await refreshToken.save();
  const accessToken = generateAccessToken(user);
  return { refreshToken, accessToken };
}

async function renewTokens(oldRefreshToken, ipAddress) {
  const oldToken = await RefreshToken.findOneAndDelete({ token: oldRefreshToken });
  if (oldToken && oldToken.expires > Date.now()) {
    const user = await User.findOne({ _id: oldToken.user });
    if (user) {
      const refreshToken = generateRefreshToken(user, ipAddress);
      await refreshToken.save();
      const accessToken = generateAccessToken(user);
      return { refreshToken, accessToken };
    }
  }
  const error = new Error('Invalid refresh token');
  error.name = 'AuthenticationError';
  throw error;
}

async function revokeToken(refreshToken) {
  const token = await RefreshToken.findOneAndDelete({ token: refreshToken });
  if (token) {
    return { success: true };
  }
  const error = new Error('Refresh token not found.');
  error.name = 'NotFoundError';
  throw error;
}

module.exports = {
  login,
  register,
  renewTokens,
  revokeToken,
};
