const paymentController = require('../controllers/paymentController');
const Payment = require('../models/Payment');
const Rental = require('../models/Rental');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Invoice = require('../models/Invoice');
const Notification = require('../models/Notification');

jest.mock('../models/Payment');
jest.mock('../models/Rental');
jest.mock('../models/Order');
jest.mock('../models/Product');
jest.mock('../models/User');
jest.mock('../models/Invoice');
jest.mock('../models/Notification');

describe('paymentController.mockPayment -> rental flow', () => {
  let req, res;
  beforeEach(() => {
    req = { params: { id: 'pay1' }, body: { outcome: 'success' }, user: { _id: 'u1', role: 'renter' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    Payment.findById.mockReset();
    Rental.findById.mockReset();
    Order.findOne.mockReset();
    Order.create.mockReset();
    Product.findById.mockReset();
    User.findById.mockReset();
    Invoice.findOne.mockReset();
    Invoice.create.mockReset();
    Notification.create.mockReset();
  });

  test('on successful rental payment: creates order, invoice and notification and returns them', async () => {
    // Payment with rental
    Payment.findById.mockResolvedValue({ _id: 'pay1', rental: 'r1', renter: 'u1' });

    // Rental with product and user
    Rental.findById.mockResolvedValue({ _id: 'r1', product: 'p1', user: 'u1', totalCost: 123.45, startDate: new Date(0) });

    // No existing order/invoice
    Order.findOne.mockResolvedValue(null);
    Order.create.mockResolvedValue({ _id: 'o1', rental: 'r1', totalAmount: 123.45, meta: { rentalStart: new Date(0), rentalEnd: new Date(1), quantity: 1 } });

    Product.findById.mockResolvedValue({ _id: 'p1', owner: 'puser', title: 'Bike', images: ['http://example.com/bike.jpg'] });
    User.findById.mockImplementation(async (id) => ({ _id: id, name: id === 'u1' ? 'Renter One' : 'Vendor Inc' }));

    Invoice.findOne.mockResolvedValue(null);
    Invoice.create.mockResolvedValue({ _id: 'inv1', order: 'o1', amount: 123.45, meta: { rentalStart: new Date(0), rentalEnd: new Date(1) } });

    Notification.create.mockResolvedValue({ _id: 'n1' });

    await paymentController.mockPayment(req, res);

    expect(Order.create).toHaveBeenCalled();
    expect(Invoice.create).toHaveBeenCalled();
    expect(Notification.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    // Ensure response includes invoice and order with rental/meta data
    const sent = res.json.mock.calls[0][0];
    expect(sent.success).toBe(true);
    expect(sent.data.invoice).toBeDefined();
    expect(sent.data.order).toBeDefined();
    expect(sent.data.order.meta).toBeDefined();
    expect(sent.data.order.meta.rentalStart).toBeDefined();
    expect(sent.data.invoice.meta.rentalStart).toBeDefined();
  });
});
