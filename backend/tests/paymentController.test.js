const paymentController = require('../controllers/paymentController');
const Payment = require('../models/Payment');
const Rental = require('../models/Rental');

jest.mock('../models/Payment');
jest.mock('../models/Rental');

describe('paymentController.processPayment', () => {
  let req, res;
  beforeEach(() => {
    req = { body: {}, user: { _id: 'u1', role: 'renter' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    Payment.findOne.mockReset();
    Payment.create.mockReset();
    Rental.findById.mockReset();
  });

  test('requires rentalId', async () => {
    await paymentController.processPayment(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('rejects if rental not found', async () => {
    req.body.rentalId = 'r1';
    Rental.findById.mockResolvedValue(null);
    await paymentController.processPayment(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
