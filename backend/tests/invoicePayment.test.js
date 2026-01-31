const paymentController = require('../controllers/paymentController');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');

jest.mock('../models/Payment');
jest.mock('../models/Invoice');

describe('paymentController.invoice flow', () => {
  let req, res;
  beforeEach(() => {
    req = { body: {}, user: { _id: 'u1' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    Payment.findOne.mockReset();
    Payment.create.mockReset();
    Invoice.findById.mockReset();
  });

  test('creating payment for invoice requires invoiceId', async () => {
    await paymentController.processPayment(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('creates payment for invoice when invoice exists', async () => {
    req.body.invoiceId = 'inv1';
    Invoice.findById.mockResolvedValue({ _id: 'inv1', order: { _id: 'o1', renter: 'u1', provider: 'p1' }, amount: 100 });
    Payment.findOne.mockResolvedValue(null);
    Payment.create.mockResolvedValue({ _id: 'pay1', amount: 100 });

    await paymentController.processPayment(req, res);

    expect(Payment.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });
});