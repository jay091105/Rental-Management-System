const orderController = require('../controllers/orderController');
const Order = require('../models/Order');
const Product = require('../models/Product');

jest.mock('../models/Order');
jest.mock('../models/Product');

describe('orderController.createOrder', () => {
  let req, res;
  beforeEach(() => {
    req = { body: {}, user: { id: 'u1' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    Product.findById.mockReset();
    Order.create.mockReset();
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
});
