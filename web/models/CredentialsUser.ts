import mongoose, { Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";

interface ICredentialsUser {
  email: string;
  password: string;
  provider?: string;
  profileCompleted?: boolean;
  createdAt: Date;
}

const CredentialsUserSchema = new Schema<ICredentialsUser>({
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [6, "Password should be at least 6 characters"],
  },
  provider: {
    type: String,
    default: "credentials",
  },
  profileCompleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
CredentialsUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

const CredentialsUser =
  (mongoose.models.CredentialsUser as Model<ICredentialsUser>) ||
  mongoose.model<ICredentialsUser>("CredentialsUser", CredentialsUserSchema);

export default CredentialsUser;
