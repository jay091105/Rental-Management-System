const paymentController = require('../controllers/paymentController');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');

jest.mock('../models/Payment');
jest.mock('../models/Invoice');

describe('paymentController.processPayment by invoice', () => {
  let req, res;
  beforeEach(() => {
    req = { body: {}, user: { _id: 'u1' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    Payment.findOne.mockReset();
    Payment.create.mockReset();
    Invoice.findById.mockReset();
  });

  test('requires invoiceId', async () => {
    await paymentController.processPayment(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('rejects when invoice not found', async () => {
    req.body.invoiceId = 'inv1';
    Invoice.findById.mockResolvedValue(null);
    await paymentController.processPayment(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});