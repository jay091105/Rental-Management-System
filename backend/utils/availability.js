const Order = require('../models/Order');

/**
 * Calculate reserved quantity for a product in a given date range.
 * Counts only orders with status 'confirmed' (configurable later).
 *
 * @param {ObjectId|string} productId
 * @param {Date|string} startDate
 * @param {Date|string} endDate
 * @returns {Promise<number>} reserved quantity
 */
async function reservedQuantity(productId, startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Overlap condition: existingStart < newEnd AND existingEnd > newStart
  const overlapMatch = {
    status: 'confirmed',
    product: productId,
    $expr: {
      $and: [
        { $lt: ["$meta.rentalStart", end] },
        { $gt: ["$meta.rentalEnd", start] }
      ]
    }
  };

  // Fallback: some orders may store dates under `rental.startDate` / `rental.endDate` or items meta
  const orders = await Order.find(overlapMatch).select('meta rental items').lean();
  let sum = 0;
  for (const o of orders) {
    const qty = o.meta?.quantity ?? o.rental?.quantity ?? (o.items?.[0]?.quantity ?? 0);
    sum += Number(qty || 0);
  }
  return sum;
}

module.exports = { reservedQuantity };
