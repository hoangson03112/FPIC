const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AccountSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: false, default: "none" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    status: { type: String, enum: ["active", "inactive"], default: "inactive" },
    avatar: { type: String, required: false },
    lastLogin: { type: Date },
  },
  { timestamps: true, collection: "account" }
);

module.exports = mongoose.model("Account", AccountSchema);
