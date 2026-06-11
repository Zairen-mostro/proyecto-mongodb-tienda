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
    productRef: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
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

const productSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true, minlength: 2 },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["Disponible", "Bajo stock", "Agotado"],
      default: "Disponible"
    }
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });
customerSchema.index({ email: 1 }, { unique: true });
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
productSchema.index({ sku: 1 }, { unique: true });
productSchema.index({ name: "text", category: "text", sku: "text" });

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Customer = mongoose.models.Customer || mongoose.model("Customer", customerSchema);
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

async function run() {
  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || undefined });

  await Promise.all([
    User.deleteMany({}),
    Order.deleteMany({}),
    Customer.deleteMany({}),
    Product.deleteMany({})
  ]);

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

  const [laptop, mouse, monitor, teclado, audifonos] = await Product.create([
    {
      sku: "LAP-001",
      name: "Laptop Lenovo ThinkPad",
      category: "Computo",
      price: 18500,
      stock: 8,
      status: "Disponible"
    },
    {
      sku: "MOU-014",
      name: "Mouse inalambrico",
      category: "Accesorios",
      price: 450,
      stock: 22,
      status: "Disponible"
    },
    {
      sku: "MON-024",
      name: "Monitor 24 pulgadas",
      category: "Pantallas",
      price: 3200,
      stock: 4,
      status: "Bajo stock"
    },
    {
      sku: "TEC-010",
      name: "Teclado mecanico",
      category: "Accesorios",
      price: 980,
      stock: 12,
      status: "Disponible"
    },
    {
      sku: "AUD-101",
      name: "Audifonos Bluetooth",
      category: "Audio",
      price: 1250,
      stock: 0,
      status: "Agotado"
    }
  ]);

  await Order.create([
    {
      customer: ana._id,
      productRef: laptop._id,
      product: laptop.name,
      quantity: 1,
      unitPrice: laptop.price,
      status: "Pagado",
      notes: "Incluye garantia extendida."
    },
    {
      customer: ana._id,
      productRef: mouse._id,
      product: mouse.name,
      quantity: 2,
      unitPrice: mouse.price,
      status: "Enviado"
    },
    {
      customer: luis._id,
      productRef: monitor._id,
      product: monitor.name,
      quantity: 1,
      unitPrice: monitor.price,
      status: "Pendiente"
    },
    {
      customer: luis._id,
      productRef: teclado._id,
      product: teclado.name,
      quantity: 1,
      unitPrice: teclado.price,
      status: "Pagado"
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
