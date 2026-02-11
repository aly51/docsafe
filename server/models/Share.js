const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const shareSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  documentIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  shareId: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  accessCount: {
    type: Number,
    default: 0
  }
});

// Hash password before saving if provided
shareSchema.pre('save', async function(next) {
  if (!this.password || !this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare passwords
shareSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return true;
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Share', shareSchema);
