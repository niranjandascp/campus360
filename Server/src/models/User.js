const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },

    department: {
      type: String,
      default: ""
    },

    year: {
      type: String,
      default: ""
    },

    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student"
    },

    userId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre("save", async function (next) {
  if (!this.userId) {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    this.userId = `CMP-${randomSuffix}`;
  }

  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

userSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);