import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { connectDB } from '../lib/mongodb';
import { Product } from '../models/Product';
import { InventoryMovement } from '../models/InventoryMovement';

async function migrateInventoryData() {
  console.log('Connecting to MongoDB Atlas...');
  await connectDB();

  const products = await Product.find({});
  console.log(`Found ${products.length} products to evaluate for Phase 8 inventory migration.`);

  let updatedCount = 0;
  let movementCount = 0;

  for (const p of products) {
    const physical = typeof p.stockQuantity === 'number' && p.stockQuantity >= 0 ? p.stockQuantity : 10;
    const reserved = typeof p.reservedQuantity === 'number' && p.reservedQuantity >= 0 ? p.reservedQuantity : 0;
    const threshold = typeof p.lowStockThreshold === 'number' && p.lowStockThreshold >= 0 ? p.lowStockThreshold : 5;
    const track = typeof p.trackInventory === 'boolean' ? p.trackInventory : true;
    const backorders = typeof p.allowBackorders === 'boolean' ? p.allowBackorders : false;
    
    // Assign realistic cost estimate if none exists (~40-45% of retail price)
    const costPrice = p.costPrice && p.costPrice > 0 ? p.costPrice : Math.round(p.price * 0.45);
    const available = track ? Math.max(0, physical - reserved) : physical;
    const inStock = track ? (available > 0 || backorders) : true;

    p.stockQuantity = physical;
    p.reservedQuantity = reserved;
    p.availableQuantity = available;
    p.lowStockThreshold = threshold;
    p.trackInventory = track;
    p.allowBackorders = backorders;
    p.costPrice = costPrice;
    p.inStock = inStock;
    p.inventoryUpdatedAt = new Date();

    await p.save();
    updatedCount++;

    // Create initial baseline movement record if none exists for this SKU
    const existingMovement = await InventoryMovement.findOne({ sku: p.sku });
    if (!existingMovement) {
      await InventoryMovement.create({
        productId: p._id,
        sku: p.sku,
        productName: p.name,
        previousQuantity: 0,
        quantityChanged: physical,
        newQuantity: physical,
        previousReserved: 0,
        newReserved: reserved,
        adjustmentType: 'Stock Received',
        reason: 'Phase 8 baseline inventory migration',
        notes: 'Initial inventory synchronization from master catalog',
        adminName: 'System Migration',
        timestamp: new Date(),
      });
      movementCount++;
    }
  }

  console.log(`Successfully migrated ${updatedCount} products with complete inventory schema.`);
  console.log(`Initialized ${movementCount} baseline audit movement records.`);
  process.exit(0);
}

migrateInventoryData().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
