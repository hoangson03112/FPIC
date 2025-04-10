// models/Role.js
const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    permissions: {
      manageUsers: { type: Boolean, default: false },
      manageProducts: { type: Boolean, default: false },
      viewDashboard: { type: Boolean, default: false },
      placeOrders: { type: Boolean, default: false },
    },
  },
  { timestamps: true, collection: "roles" }
);

module.exports = mongoose.model("Role", RoleSchema);
