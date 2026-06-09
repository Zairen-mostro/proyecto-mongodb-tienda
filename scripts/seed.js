const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: ".env.local" });
dotenv.config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Falta MONGODB_URI. Copia .env.example a .env.local y coloca tu cadena de Atlas.");
}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^\S+@\S+\.\S+$/
    },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true }
);

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^\S+@\S+\.\S+$/
    },
    phone: { type: String, required: true, trim: true, minlength: 7 },
    status: { type: String, enum: ["Activo", "Inactivo"], default: "Activo" },
    notes: { type: String, trim: true, maxlength: 300 }
  },
  { timestamps: true }
);

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    product: { type: String, required: true, trim: true, minlength: 2 },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["Pendiente", "Pagado", "Enviado", "Cancelado"],
      default: "Pendiente"
    },
    notes: { type: String, trim: true, maxlength: 300 }
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });
customerSchema.index({ email: 1 }, { unique: true });
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Customer = mongoose.models.Customer || mongoose.model("Customer", customerSchema);
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

async function run() {
  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || undefined });

  await Promise.all([User.deleteMany({}), Order.deleteMany({}), Customer.deleteMany({})]);

  const passwordHash = await bcrypt.hash("Demo1234", 10);
  await User.create({
    name: "Usuario Demo",
    email: "demo@demo.com",
    passwordHash
  });

  const [ana, luis] = await Customer.create([
    {
      name: "Ana Martinez",
      email: "ana@example.com",
      phone: "6681234567",
      status: "Activo",
      notes: "Cliente frecuente de la tienda."
    },
    {
      name: "Luis Perez",
      email: "luis@example.com",
      phone: "6677654321",
      status: "Activo",
      notes: "Prefiere recibir pedidos por la tarde."
    }
  ]);

  await Order.create([
    {
      customer: ana._id,
      product: "Laptop Lenovo ThinkPad",
      quantity: 1,
      unitPrice: 18500,
      status: "Pagado",
      notes: "Incluye garantia extendida."
    },
    {
      customer: ana._id,
      product: "Mouse inalambrico",
      quantity: 2,
      unitPrice: 450,
      status: "Enviado"
    },
    {
      customer: luis._id,
      product: "Monitor 24 pulgadas",
      quantity: 1,
      unitPrice: 3200,
      status: "Pendiente"
    }
  ]);

  await mongoose.disconnect();
  console.log("Seed completado: demo@demo.com / Demo1234");
}

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
