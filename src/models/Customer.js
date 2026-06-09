import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre del cliente es obligatorio."],
      trim: true,
      minlength: 2
    },
    email: {
      type: String,
      required: [true, "El email del cliente es obligatorio."],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "El email no tiene un formato valido."]
    },
    phone: {
      type: String,
      required: [true, "El telefono es obligatorio."],
      trim: true,
      minlength: 7
    },
    status: {
      type: String,
      enum: ["Activo", "Inactivo"],
      default: "Activo"
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 300
    }
  },
  { timestamps: true }
);

customerSchema.index({ email: 1 }, { unique: true });

export default mongoose.models.Customer ||
  mongoose.model("Customer", customerSchema);
