const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  permissions: {
    type: [String],
    enum: ["read", "write", "edit", "delete", "manage"],
    default: ["read"],
  },
});

const Role = mongoose.model("Role", roleSchema);

module.exports = Role;
