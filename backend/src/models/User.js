import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { encryptPassword } from "../utils/passwordVault.js";

function normalizeEmail(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized || undefined;
}

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    userName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      set: normalizeEmail
    },
    password: {
      type: String,
      required: true
    },
    passwordEncrypted: {
      type: String,
      default: ""
    },
    role: {
      type: String,
      enum: ["admin", "user", "super_admin", "journal_admin"],
      default: "admin"
    },
    assignedJournals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Journal"
      }
    ]
  },
  {
    timestamps: true
  }
);

userSchema.virtual("name").get(function getName() {
  return [this.firstName, this.lastName].filter(Boolean).join(" ").trim();
});

userSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: {
      email: { $type: "string" }
    }
  }
);

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    next();
    return;
  }

  this.passwordEncrypted = encryptPassword(this.password);
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
