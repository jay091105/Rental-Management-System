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
