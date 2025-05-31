import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const { Schema } = mongoose;

const userSchema = new Schema({
  watchHistory: [{
    type: Schema.Types.ObjectId,
    ref: 'videos'
  }],
  username: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  fullName: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  coverImage: {
    type: String // URL from Cloudinary
  },
  password: {
    type: String,
    required: true,
  
  },
  refreshToken: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 🔐 Hash password only if it's modified or new
userSchema.pre("save", async function(next) {
  console.log(">>> pre-save triggered");
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


// 🔑 Compare plain text password with hashed
userSchema.methods.comparePassword = async function(candidatePassword) {
  //$2b$10$7.ThG0dv1LoCnCBezGR2dur.KaygJw7DIDcdwaVYzDicIJMoeUZEG
  console.log("Comparing password for user:", this.username);
  console.log("Candidate password:", candidatePassword);
  console.log("Stored hashed password:", this.password);

  if (!this.password) throw new Error("Password not set on user document");
  return await bcrypt.compare(candidatePassword, this.password);
};

// 🎫 Generate JWT access token
userSchema.methods.generateAccessToken = function() {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1d'  // fallback expiry
    }
  );
};

// 🔁 Generate JWT refresh token
userSchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d'  // fallback expiry
    }
  );
};

export const User = mongoose.model('User', userSchema);
