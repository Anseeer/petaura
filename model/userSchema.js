const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: false,
    unique: false,
    sparse: true,
    default: null
  },
  photo: {
    type: String,
    required: false
  },
  googleId: {
    type: String,
    unique: true
  },
  password: {
    type: String,
    required: false
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  referalCode: {
    type: String
  },
  redeemed: {
    type: Boolean
  },
  redeemedUsers: [{
    type: Schema.Types.ObjectId,
    ref: "User"
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  searchHistory: [{
    category: {
      type: Schema.Types.ObjectId,
      ref: "Catogory"
    },
    brand: {
      type: String,
    },
    searchOn: {
      type: Date,
      default: Date.now
    },

  }]

},
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User; 