const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: ".env.local" });
dotenv.config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Falta MONGODB_URI.");
}

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

productSchema.index({ sku: 1 }, { unique: true });

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

const products = [
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
  },
  {
    sku: "IMP-220",
    name: "Impresora termica 58mm",
    category: "Punto de venta",
    price: 1490,
    stock: 6,
    status: "Disponible"
  }
];

async function run() {
  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || undefined });

  for (const product of products) {
    await Product.updateOne(
      { sku: product.sku },
      { $set: product },
      { upsert: true, runValidators: true }
    );
  }

  await mongoose.disconnect();
  console.log("Catalogo actualizado.");
}

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
