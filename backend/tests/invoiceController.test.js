const invoiceController = require('../controllers/invoiceController');
const Invoice = require('../models/Invoice');
const Order = require('../models/Order');

jest.mock('../models/Invoice');
jest.mock('../models/Order');

describe('invoiceController.createInvoice', () => {
  let req, res;
  beforeEach(() => {
    req = { body: {}, user: { id: 'u1', role: 'provider' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    Order.findById.mockReset();
    Invoice.create.mockReset();
  });

  test('requires orderId', async () => {
    await invoiceController.createInvoice(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('rejects when order not found', async () => {
    req.body.orderId = 'o1';
    Order.findById.mockResolvedValue(null);
    await invoiceController.createInvoice(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe('invoiceController.getMyInvoices', () => {
  let req, res;
  beforeEach(() => {
    req = { user: { id: 'prov1', role: 'provider' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    Invoice.find.mockReset();
  });

  test('provider sees invoices for their orders', async () => {
    const invoices = [
      { _id: 'i1', order: { _id: 'o1', renter: 'r2', provider: 'prov1' } },
      { _id: 'i2', order: { _id: 'o2', renter: 'r3', provider: 'prov1' } },
      { _id: 'i3', order: null }
    ];
    Invoice.find.mockResolvedValue(invoices);

    await invoiceController.getMyInvoices(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, count: 2 }));
  });

  test('renter still sees only their invoices', async () => {
    req.user = { id: 'r2', role: 'renter' };
    const invoices = [
      { _id: 'i1', order: { _id: 'o1', renter: 'r2', provider: 'prov1' } },
      { _id: 'i2', order: { _id: 'o2', renter: 'r3', provider: 'prov1' } }
    ];
    Invoice.find.mockResolvedValue(invoices);

    await invoiceController.getMyInvoices(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, count: 1 }));
  });
});

describe('invoiceController.downloadInvoice (authorization & streaming)', () => {
  let req, res;
  beforeEach(() => {
    req = { params: { id: 'inv1' }, user: { id: 'r1', role: 'renter' } };
    res = { setHeader: jest.fn(), status: jest.fn().mockReturnThis(), json: jest.fn(), pipe: jest.fn() };
    Invoice.findById.mockReset();
    jest.resetModules();
  });

  test('allows renter to download their invoice', async () => {
    // invoice with populated order
    Invoice.findById.mockResolvedValue({ _id: 'inv1', order: { _id: 'o1', renter: 'r1', provider: 'p1' }, toObject: () => ({ _id: 'inv1', order: { _id: 'o1', renter: 'r1', provider: 'p1' } }) });
    const fakeStream = require('stream').PassThrough();
    // mock generateInvoicePDF
    jest.doMock('../utils/generateInvoicePDF', () => jest.fn(() => fakeStream));
    const invoiceControllerFresh = require('../controllers/invoiceController');

    // stub res.pipe by observing that the stream is piped to res (we'll attach a mock writable)
    const writeSpy = jest.fn();
    // Ensure we have a writable to pipe to — express res is writable; we only need headers called
    res = { setHeader: jest.fn(), status: jest.fn().mockReturnThis(), json: jest.fn() };

    await invoiceControllerFresh.downloadInvoice(req, res);

    expect(Invoice.findById).toHaveBeenCalledWith('inv1');
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
    expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', expect.stringContaining('invoice-inv1.pdf'));
  });

  test('allows provider to download invoice for their order', async () => {
    req.user = { id: 'p1', role: 'provider' };
    Invoice.findById.mockResolvedValue({ _id: 'inv1', order: { _id: 'o1', renter: 'r1', provider: 'p1' }, toObject: () => ({ _id: 'inv1' }) });
    jest.doMock('../utils/generateInvoicePDF', () => jest.fn(() => require('stream').PassThrough()));
    const invoiceControllerFresh = require('../controllers/invoiceController');
    res = { setHeader: jest.fn(), status: jest.fn().mockReturnThis(), json: jest.fn() };

    await invoiceControllerFresh.downloadInvoice(req, res);

    expect(Invoice.findById).toHaveBeenCalledWith('inv1');
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
  });

  test('blocks unauthorized user from downloading', async () => {
    req.user = { id: 'other', role: 'renter' };
    Invoice.findById.mockResolvedValue({ _id: 'inv1', order: { _id: 'o1', renter: 'r1', provider: 'p1' } });
    const invoiceControllerFresh = require('../controllers/invoiceController');
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await invoiceControllerFresh.downloadInvoice(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });
});
