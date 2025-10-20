import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },
  name:  { type: String, default: "" },
  passwordHash: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model("User", UserSchema);
