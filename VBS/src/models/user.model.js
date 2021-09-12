const { Schema, connection } = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
    isApproved: { type: Boolean, required: true, default: false },
  },
  {
    collection: "user",
    timestamps: true,
  }
);

// eslint-disable-next-line func-names
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const hash = await bcrypt.hash(this.password, 12);
    this.password = hash;
    return next();
  } catch (err) {
    return next(err);
  }
});

module.exports = connection.model("UserSchema", UserSchema);
