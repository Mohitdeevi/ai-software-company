import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'team', 'enterprise'],
      default: 'free',
    },
    githubToken: {
      type: String,
      select: false,
    },
    tokenUsage: {
      used: { type: Number, default: 0 },
      limit: { type: Number, default: 500000 },
      resetAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.refreshToken;
  delete obj.githubToken;
  delete obj.__v;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
