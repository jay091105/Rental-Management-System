const quotationController = require('../controllers/quotationController');
const Quotation = require('../models/Quotation');
const Product = require('../models/Product');

jest.mock('../models/Quotation');
jest.mock('../models/Product');

describe('quotationController.createQuotation', () => {
  let req, res;
  beforeEach(() => {
    req = { body: {}, user: { id: 'u1' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    Product.findById.mockReset();
    Quotation.create.mockReset();
  });

  test('requires productId', async () => {
    await quotationController.createQuotation(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('rejects when product not found', async () => {
    req.body.productId = 'p1';
    Product.findById.mockResolvedValue(null);
    await quotationController.createQuotation(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('rejects when product is unpublished', async () => {
    req.body.productId = 'p2';
    req.body.quantity = 1;
    Product.findById.mockResolvedValue({ _id: 'p2', published: false, availableUnits: 5 });
    await quotationController.createQuotation(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('rejects when requested quantity exceeds availability', async () => {
    req.body.productId = 'p3';
    req.body.quantity = 3;
    Product.findById.mockResolvedValue({ _id: 'p3', published: true, availableUnits: 2 });
    await quotationController.createQuotation(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('confirmQuotation blocks when overlapping confirmed orders exhaust availability', async () => {
    const quote = { _id: 'q1', requester: 'u1', items: [{ product: 'p1', quantity: 3, rentalStart: '2026-04-01', rentalEnd: '2026-04-03' }], provider: 'prov1', totalAmount: 100, status: 'draft' };
    Quotation.findById = jest.fn().mockResolvedValue(quote);
    Product.findById = jest.fn().mockResolvedValue({ _id: 'p1', availableUnits: 4 });

    jest.mock('../utils/availability', () => ({ reservedQuantity: jest.fn().mockResolvedValue(2) }));
    const availability = require('../utils/availability');
    availability.reservedQuantity.mockResolvedValue(2);

    const req2 = { params: { id: 'q1' }, user: { id: 'u1' } };
    const res2 = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await quotationController.confirmQuotation(req2, res2);
    expect(res2.status).toHaveBeenCalledWith(400);
  });

  test('confirmQuotation converts to Order when availability ok', async () => {
    const quote = { _id: 'q2', requester: 'u2', items: [{ product: 'p2', quantity: 1, rentalStart: '2026-05-01', rentalEnd: '2026-05-02', pricePerUnit: 50 }], provider: 'prov2', totalAmount: 50, status: 'draft' };
    Quotation.findById = jest.fn().mockResolvedValue(quote);
    Product.findById = jest.fn().mockResolvedValue({ _id: 'p2', availableUnits: 4 });
    const availability = require('../utils/availability');
    availability.reservedQuantity.mockResolvedValue(0);

    const Order = require('../models/Order');
    Order.create = jest.fn().mockResolvedValue({ _id: 'order-from-quote' });

    const req3 = { params: { id: 'q2' }, user: { id: 'u2' } };
    const res3 = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await quotationController.confirmQuotation(req3, res3);
    expect(res3.status).toHaveBeenCalledWith(201);
    expect(res3.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: expect.objectContaining({ _id: 'order-from-quote' }) }));
  });
});