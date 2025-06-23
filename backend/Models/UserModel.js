const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // ❌ was required: true
  googleId: { type: String },
  address: {
    type: AddressSchema,
    required: false, // ✅ Make this optional
  },
  role: { type: String, enum: ['user', 'seller'], default: 'user' },
  phone: { type: String, required: false }, // ✅ Make this optional
  profilePic: { type: String },
}, { timestamps: true });

UserSchema.pre('validate', function (next) {
  if (!this.googleId) {
    if (!this.password) this.invalidate('password', 'Password is required.');
    if (!this.phone) this.invalidate('phone', 'Phone is required.');
    
    if (!this.address) {
      this.invalidate('address', 'Address is required.');
    } else {
      if (!this.address.city) this.invalidate('address.city', 'City is required.');
      if (!this.address.state) this.invalidate('address.state', 'State is required.');
      if (!this.address.zip) this.invalidate('address.zip', 'Zip is required.');
      if (!this.address.country) this.invalidate('address.country', 'Country is required.');
    }
  }
  next();
});




module.exports = mongoose.model("User", UserSchema);
