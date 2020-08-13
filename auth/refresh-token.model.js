const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  token: String,
  expires: Date,
  createdByIp: String,
});

schema.virtual('isExpired').get(() => Date.now() >= this.expires);
schema.virtual('isActive').get(() => !this.revoked && !this.isExpired);

module.exports = mongoose.model('RefreshToken', schema);
