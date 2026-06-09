import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "El cliente es obligatorio."]
    },
    product: {
      type: String,
      required: [true, "El producto es obligatorio."],
      trim: true,
      minlength: 2
    },
    quantity: {
      type: Number,
      required: [true, "La cantidad es obligatoria."],
      min: [1, "La cantidad minima es 1."]
    },
    unitPrice: {
      type: Number,
      required: [true, "El precio unitario es obligatorio."],
      min: [0, "El precio no puede ser negativo."]
    },
    status: {
      type: String,
      enum: ["Pendiente", "Pagado", "Enviado", "Cancelado"],
      default: "Pendiente"
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 300
    }
  },
  { timestamps: true }
);

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
