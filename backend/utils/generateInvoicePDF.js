const PDFDocument = require('pdfkit');
const { PassThrough } = require('stream');

/**
 * generateInvoicePDF(invoice)
 * - invoice: mongoose document or plain object with populated order, customer, vendor, items, totals
 * Returns: Readable stream (PDF)
 */
function generateInvoicePDF(invoice) {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const stream = new PassThrough();
  doc.pipe(stream);

  const companyName = process.env.COMPANY_NAME || 'Company Name';
  const gstin = process.env.COMPANY_GSTIN || 'GSTIN: NA';

  // Header
  doc.fontSize(20).text(companyName, { align: 'left' });
  doc.fontSize(10).text(gstin, { align: 'left' });
  doc.fontSize(22).text('INVOICE', { align: 'right' });
  doc.moveDown();

  // Invoice meta
  doc.fontSize(10);
  doc.text(`Invoice ID: ${invoice._id}`, { continued: true }).text(``, { align: 'right' });
  doc.text(`Order ID: ${invoice.order?._id || invoice.order}`, { align: 'right' });
  doc.text(`Date: ${new Date(invoice.issuedAt || invoice.createdAt || Date.now()).toLocaleDateString()}`, { align: 'right' });
  doc.moveDown(0.5);

  // Bill to / Vendor
  const customerName = invoice.customer?.name || invoice.customer?.email || (invoice.meta && invoice.meta.customerName) || 'Customer';
  const vendorName = invoice.vendor?.name || invoice.vendor?.email || (invoice.meta && invoice.meta.vendorName) || 'Vendor';

  doc.fontSize(10).text(`Bill to: ${customerName}`);
  doc.text(`Vendor: ${vendorName}`);
  doc.moveDown();

  // Rental period (if present)
  const rentalStart = invoice.meta?.rentalStart || invoice.order?.meta?.rentalStart;
  const rentalEnd = invoice.meta?.rentalEnd || invoice.order?.meta?.rentalEnd;
  if (rentalStart || rentalEnd) {
    doc.text(`Rental period: ${rentalStart ? new Date(rentalStart).toLocaleDateString() : '—'} — ${rentalEnd ? new Date(rentalEnd).toLocaleDateString() : '—'}`);
    doc.moveDown();
  }

  // Items table header
  doc.moveDown(0.5);
  doc.fontSize(10).text('Item', 50, doc.y, { continued: true });
  doc.text('Qty', 280, doc.y, { width: 50, align: 'right', continued: true });
  doc.text('Unit Price', 330, doc.y, { width: 80, align: 'right', continued: true });
  doc.text('Total', 420, doc.y, { width: 90, align: 'right' });
  doc.moveTo(40, doc.y + 4).lineTo(560, doc.y + 4).stroke();
  doc.moveDown(0.5);

  const items = Array.isArray(invoice.items) && invoice.items.length > 0 ? invoice.items : (
    invoice.order && invoice.order.items ? invoice.order.items : []
  );

  items.forEach((it) => {
    const title = (it.productSnapshot && it.productSnapshot.title) || it.description || it.title || 'Item';
    const qty = it.quantity || 1;
    const unit = typeof it.price === 'number' ? it.price : (it.unitPrice || 0);
    const lineTotal = Math.round((qty * unit) * 100) / 100;
    doc.text(title, 50, doc.y, { continued: true });
    doc.text(String(qty), 280, doc.y, { width: 50, align: 'right', continued: true });
    doc.text(`₹${unit.toFixed(2)}`, 330, doc.y, { width: 80, align: 'right', continued: true });
    doc.text(`₹${lineTotal.toFixed(2)}`, 420, doc.y, { width: 90, align: 'right' });
    doc.moveDown(0.2);
  });

  // Totals
  doc.moveDown(1);
  const subtotal = Number(invoice.subtotal ?? invoice.amount ?? 0);
  const tax = Number(invoice.taxAmount ?? 0);
  const securityDeposit = Number(invoice.securityDeposit ?? 0);
  const total = Number(invoice.totalAmount ?? invoice.amount ?? subtotal + tax + securityDeposit);
  const paid = Number(invoice.amountPaid ?? 0);
  const balance = Number(invoice.balanceDue ?? (total - paid));

  const rightColX = 380;
  const labelX = rightColX;
  const valueX = 520;
  doc.fontSize(10);
  doc.text('Invoice Subtotal', labelX, doc.y, { width: 120, align: 'right', continued: true });
  doc.text(`₹${subtotal.toFixed(2)}`, valueX, doc.y, { width: 80, align: 'right' });
  doc.moveDown(0.3);
  doc.text('Tax', labelX, doc.y, { width: 120, align: 'right', continued: true });
  doc.text(`₹${tax.toFixed(2)}`, valueX, doc.y, { width: 80, align: 'right' });
  doc.moveDown(0.3);
  if (securityDeposit > 0) {
    doc.text('Security Deposit', labelX, doc.y, { width: 120, align: 'right', continued: true });
    doc.text(`₹${securityDeposit.toFixed(2)}`, valueX, doc.y, { width: 80, align: 'right' });
    doc.moveDown(0.3);
  }
  doc.text('TOTAL', labelX, doc.y, { width: 120, align: 'right', continued: true, underline: true });
  doc.text(`₹${total.toFixed(2)}`, valueX, doc.y, { width: 80, align: 'right', underline: true });
  doc.moveDown(0.5);
  doc.text('Paid', labelX, doc.y, { width: 120, align: 'right', continued: true });
  doc.text(`₹${paid.toFixed(2)}`, valueX, doc.y, { width: 80, align: 'right' });
  doc.moveDown(0.3);
  doc.text('Balance Due', labelX, doc.y, { width: 120, align: 'right', continued: true });
  doc.text(`₹${balance.toFixed(2)}`, valueX, doc.y, { width: 80, align: 'right' });

  // Footer
  doc.moveDown(4);
  doc.fontSize(9).text('Please make all checks payable to ' + companyName + '.', { align: 'center' });
  doc.text('Total due in 30 days. Overdue accounts subject to a service charge.', { align: 'center' });

  doc.end();
  return stream;
}

module.exports = generateInvoicePDF;
