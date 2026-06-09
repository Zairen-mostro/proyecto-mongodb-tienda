import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre es obligatorio."],
      trim: true,
      minlength: 2
    },
    email: {
      type: String,
      required: [true, "El email es obligatorio."],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "El email no tiene un formato valido."]
    },
    passwordHash: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });

export default mongoose.models.User || mongoose.model("User", userSchema);
