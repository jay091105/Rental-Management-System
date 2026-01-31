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
