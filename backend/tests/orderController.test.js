const orderController = require('../controllers/orderController');
const Order = require('../models/Order');
const Product = require('../models/Product');

jest.mock('../models/Order');
jest.mock('../models/Product');
jest.mock('../models/Pickup');
jest.mock('../models/Return');

describe('orderController.createOrder', () => {
  let req, res;
  beforeEach(() => {
    req = { body: {}, user: { id: 'u1' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    Product.findById.mockReset();
    Order.create.mockReset();
    Order.findById && Order.findById.mockReset && Order.findById.mockReset();
  });

  test('requires productId', async () => {
    await orderController.createOrder(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('rejects when product not found', async () => {
    req.body.productId = 'p1';
    Product.findById.mockResolvedValue(null);
    await orderController.createOrder(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('getProviderOrders returns rental/order metadata', async () => {
    const mockOrder = { _id: 'o1', product: { title: 'Drill' }, totalAmount: 100, status: 'pending', meta: { rentalStart: '2026-03-01', rentalEnd: '2026-03-03', quantity: 2 }, renter: { name: 'Renter' }, rental: { startDate: '2026-03-01', endDate: '2026-03-03', quantity: 2 } };
    Order.find.mockResolvedValue([mockOrder]);
    const req2 = { user: { id: 'prov1' } };
    const res2 = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await orderController.getProviderOrders(req2, res2);
    expect(res2.status).toHaveBeenCalledWith(200);
    expect(res2.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: expect.any(Array) }));
  });

  test('includes orders where product.owner matches provider even if order.provider is missing', async () => {
    // Simulate one order without provider but with product owned by provider
    const orphanOrder = { _id: 'o-orphan', provider: null, product: { _id: 'p-orphan', owner: 'provZ', title: 'Camera' }, totalAmount: 250 };
    // Product.find should return the product id owned by provider
    Product.find.mockResolvedValue([{ _id: 'p-orphan' }]);
    // Order.find should return the orphanOrder when called by controller (we mock it directly)
    Order.find.mockResolvedValue([orphanOrder]);

    const req3 = { user: { id: 'provZ' } };
    const res3 = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await orderController.getProviderOrders(req3, res3);

    expect(res3.status).toHaveBeenCalledWith(200);
    expect(res3.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: expect.arrayContaining([expect.objectContaining({ _id: 'o-orphan' })]) }));
  });

  test('getOrder allows provider to fetch their order and returns timeline', async () => {
    const mockOrder = { _id: 'oX', product: { title: 'Saw' }, provider: { _id: 'provX' }, renter: { name: 'Renter' }, totalAmount: 50, createdAt: new Date('2026-01-01T00:00:00Z'), statusHistory: [{ status: 'confirmed', at: new Date('2026-01-02T00:00:00Z'), by: 'provX' }] };
    Order.findById = jest.fn().mockResolvedValue(mockOrder);
    const req3 = { params: { id: 'oX' }, user: { id: 'provX', role: 'provider' } };
    const res3 = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await orderController.getOrder(req3, res3);
    expect(Order.findById).toHaveBeenCalledWith('oX');
    expect(res3.status).toHaveBeenCalledWith(200);
    expect(res3.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: expect.objectContaining({ _id: 'oX', timeline: expect.any(Array) }) }));
  });

  test('updateStatus appends to statusHistory when changing status', async () => {
    const orderDoc = { _id: 'oY', status: 'pending', statusHistory: [], save: jest.fn().mockResolvedValue(true), toObject: function() { return this; } };
    Order.findById = jest.fn().mockResolvedValue(orderDoc);
    const req = { params: { id: 'oY' }, body: { status: 'confirmed' }, user: { id: 'provA', role: 'provider' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    // spy on emitter
    const emitter = require('../utils/events');
    jest.spyOn(emitter, 'emit');

    await orderController.updateStatus(req, res);
    expect(orderDoc.statusHistory.length).toBe(1);
    expect(orderDoc.statusHistory[0].status).toBe('confirmed');
    expect(emitter.emit).toHaveBeenCalledWith(`order:${orderDoc._id}`, expect.objectContaining({ type: 'order.updated', order: expect.any(Object) }));
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('blocks createOrder when date-overlap causes overbooking', async () => {
    req.body.productId = 'p-avail';
    req.body.quantity = 3;
    req.body.rentalStart = '2026-03-10';
    req.body.rentalEnd = '2026-03-12';

    Product.findById.mockResolvedValue({ _id: 'p-avail', availableUnits: 4, title: 'Drill' });

    // mock the availability util to report 2 units already reserved
    jest.mock('../utils/availability', () => ({ reservedQuantity: jest.fn().mockResolvedValue(2) }));
    // Re-require the module so our mock is picked up by the controller (node caching)
    const availability = require('../utils/availability');
    availability.reservedQuantity.mockResolvedValue(2);

    await orderController.createOrder(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: expect.stringContaining('not available') }));
  });

  test('allows createOrder when enough units available for requested dates', async () => {
    req.body.productId = 'p-avail2';
    req.body.quantity = 1;
    req.body.rentalStart = '2026-03-10';
    req.body.rentalEnd = '2026-03-12';

    Product.findById.mockResolvedValue({ _id: 'p-avail2', availableUnits: 4, title: 'Drill' });
    const availability = require('../utils/availability');
    availability.reservedQuantity.mockResolvedValue(2);

    Order.create.mockResolvedValue({ _id: 'o-new' });
    await orderController.createOrder(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: expect.objectContaining({ _id: 'o-new' }) }));
  });

  test('confirming an order auto-creates a Pickup', async () => {
    const orderDoc = { _id: 'oC', status: 'pending', provider: 'prov1', meta: { rentalStart: '2026-06-01' }, save: jest.fn().mockResolvedValue(true), toObject: function() { return this; } };
    Order.findById = jest.fn().mockResolvedValue(orderDoc);

    // ensure no existing pickup
    const Pickup = require('../models/Pickup');
    Pickup.findOne = jest.fn().mockResolvedValue(null);
    Pickup.create = jest.fn().mockResolvedValue({ _id: 'pC', order: 'oC' });

    const req = { params: { id: 'oC' }, body: { status: 'confirmed' }, user: { id: 'prov1', role: 'provider' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await orderController.updateStatus(req, res);
    expect(Pickup.create).toHaveBeenCalledWith(expect.objectContaining({ order: 'oC' }));
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('provider can mark an order as picked up', async () => {
    const orderDoc = { _id: 'oP', provider: 'provP', product: { _id: 'prod1' }, meta: { quantity: 2 }, statusHistory: [], save: jest.fn().mockResolvedValue(true), toObject: function() { return this; } };
    Order.findById = jest.fn().mockResolvedValue(orderDoc);

    const Pickup = require('../models/Pickup');
    Pickup.findOne = jest.fn().mockResolvedValue(null);
    Pickup.create = jest.fn().mockResolvedValue({ _id: 'pk1', order: 'oP', pickedAt: new Date() });

    const req = { params: { id: 'oP' }, user: { id: 'provP', role: 'provider' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await orderController.markPickup(req, res);
    expect(Pickup.create).toHaveBeenCalled();
    expect(orderDoc.status).toBe('picked_up');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('provider marks return — late fee calculated and stock restored', async () => {
    const now = new Date('2026-07-10T00:00:00Z');
    jest.useFakeTimers().setSystemTime(now);

    const orderDoc = {
      _id: 'oR',
      provider: 'provR',
      product: { _id: 'prodR' },
      meta: { rentalStart: '2026-07-01', rentalEnd: '2026-07-05', quantity: 1 },
      items: [{ price: 100 }],
      totalAmount: 400,
      statusHistory: [],
      financial: {},
      save: jest.fn().mockResolvedValue(true),
      toObject: function() { return this; }
    };
    Order.findById = jest.fn().mockResolvedValue(orderDoc);

    const Return = require('../models/Return');
    Return.create = jest.fn().mockResolvedValue({ _id: 'ret1', lateFee: 300 });

    const Product = require('../models/Product');
    Product.findByIdAndUpdate = jest.fn().mockResolvedValue(true);

    const req = { params: { id: 'oR' }, user: { id: 'provR', role: 'provider' }, body: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await orderController.markReturn(req, res);

    expect(Return.create).toHaveBeenCalled();
    expect(Product.findByIdAndUpdate).toHaveBeenCalledWith('prodR', expect.objectContaining({ $inc: { availableUnits: 1 } }));
    expect(orderDoc.financial.lateFee).toBeGreaterThanOrEqual(0);
    expect(orderDoc.status).toBe('late');
    expect(res.status).toHaveBeenCalledWith(200);
    jest.useRealTimers();
  });
});
