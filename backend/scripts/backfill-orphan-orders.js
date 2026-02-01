#!/usr/bin/env node
/*
  Backfill orphan orders: set order.provider = product.owner when missing
  Usage:
    node backend/scripts/backfill-orphan-orders.js --dry-run
    node backend/scripts/backfill-orphan-orders.js --apply --limit=100
*/
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/rentify';

async function main() {
  const args = require('minimist')(process.argv.slice(2));
  const dry = !!args['dry-run'] || !args['apply'];
  const limit = Number(args.limit) || 100;

  console.log(`Connecting to ${MONGO} ...`);
  await mongoose.connect(MONGO);

  const cursor = Order.find({ $or: [{ provider: { $exists: false } }, { provider: null }] , 'product.owner': { $exists: true } }).limit(limit).cursor();
  let count = 0;
  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    const prod = await Product.findById(doc.product).select('owner');
    if (!prod || !prod.owner) continue;
    console.log(`Order ${doc._id} -> provider will be set to ${prod.owner}`);
    count++;
    if (!dry) {
      await Order.updateOne({ _id: doc._id }, { $set: { provider: prod.owner, _meta_backfilled: true } });
    }
  }

  console.log(`${dry ? 'DRY-RUN' : 'APPLY'} completed. Processed ${count} orders.`);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
