import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: [true, "El SKU es obligatorio."],
      trim: true,
      uppercase: true
    },
    name: {
      type: String,
      required: [true, "El nombre es obligatorio."],
      trim: true,
      minlength: 2
    },
    category: {
      type: String,
      required: [true, "La categoria es obligatoria."],
      trim: true
    },
    price: {
      type: Number,
      required: [true, "El precio es obligatorio."],
      min: [0, "El precio no puede ser negativo."]
    },
    stock: {
      type: Number,
      required: [true, "El stock es obligatorio."],
      min: [0, "El stock no puede ser negativo."]
    },
    status: {
      type: String,
      enum: ["Disponible", "Bajo stock", "Agotado"],
      default: "Disponible"
    }
  },
  { timestamps: true }
);

productSchema.index({ sku: 1 }, { unique: true });
productSchema.index({ name: "text", category: "text", sku: "text" });

export default mongoose.models.Product ||
  mongoose.model("Product", productSchema);
