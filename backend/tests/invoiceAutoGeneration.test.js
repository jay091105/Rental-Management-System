const orderController = require('../controllers/orderController');
const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Notification = require('../models/Notification');

jest.mock('../models/Invoice');
jest.mock('../models/Product');
jest.mock('../models/Order');
jest.mock('../models/Notification');

describe('invoice auto-generation on order creation', () => {
  beforeEach(() => {
    Invoice.findOne.mockReset();
    Invoice.create.mockReset();
    Product.findById.mockReset();
    Order.create.mockReset();
    Notification.create.mockReset();
  });

  test('createOrder -> creates invoice when none exists', async () => {
    const fakeProduct = { _id: 'p1', owner: 'prov1', price: 10, title: 'Thing' };
    Product.findById.mockResolvedValue(fakeProduct);

    const createdOrder = { _id: 'o1', renter: 'renter1', provider: 'prov1', items: [{ quantity: 1, price: 10 }], totalAmount: 10, meta: { rentalStart: new Date(), rentalEnd: new Date() }, toObject: () => ({ _id: 'o1' }) };
    Order.create.mockResolvedValue(createdOrder);

    Invoice.findOne.mockResolvedValue(null);
    Invoice.create.mockResolvedValue({ _id: 'inv1', order: 'o1', totalAmount: 10 });
    Notification.create.mockResolvedValue({ _id: 'n1' });

    const req = { body: { productId: 'p1', quantity: 1 }, user: { id: 'renter1', role: 'renter' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await orderController.createOrder(req, res, next);

    expect(Product.findById).toHaveBeenCalledWith('p1');
    expect(Order.create).toHaveBeenCalled();
    expect(Invoice.create).toHaveBeenCalled();
    expect(Notification.create).toHaveBeenCalledWith(expect.objectContaining({ user: 'prov1', type: 'INVOICE_GENERATED' }));
    expect(res.status).toHaveBeenCalledWith(201);
    // response contains order (data) and should attach invoice (backwards-compatible)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: expect.objectContaining({ invoice: expect.any(Object) }) }));
  });

  test('createOrder -> does not duplicate invoice if exists', async () => {
    const fakeProduct = { _id: 'p2', owner: 'prov2', price: 20, title: 'Other' };
    Product.findById.mockResolvedValue(fakeProduct);

    const createdOrder = { _id: 'o2', renter: 'renter2', provider: 'prov2', items: [{ quantity: 1, price: 20 }], totalAmount: 20, meta: {}, toObject: () => ({ _id: 'o2' }) };
    Order.create.mockResolvedValue(createdOrder);

    Invoice.findOne.mockResolvedValue({ _id: 'inv-existing', order: 'o2' });

    const req = { body: { productId: 'p2', quantity: 1 }, user: { id: 'renter2', role: 'renter' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await orderController.createOrder(req, res, next);

    expect(Invoice.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: expect.objectContaining({ invoice: expect.any(Object) }) }));
  });
});

// Tests for download permission live in invoiceController tests; keep them focused there.