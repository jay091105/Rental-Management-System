const productController = require('../controllers/productController');
const Product = require('../models/Product');

jest.mock('../models/Product');

describe('productController.createProduct validation', () => {
  let req;
  let res;

  beforeEach(() => {
    req = { body: {} , user: { id: 'user1' }};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    Product.create.mockReset();
  });

  test('returns 400 when required fields are missing', async () => {
    await productController.createProduct(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  test('creates product when required fields present', async () => {
    req.body = {
      title: 'Test',
      description: 'desc',
      category: 'Other',
      location: 'loc',
      pricePerDay: 100
    };
    Product.create.mockResolvedValue({ _id: 'p1', ...req.body });

    await productController.createProduct(req, res);

    expect(Product.create).toHaveBeenCalledWith(expect.objectContaining({ owner: req.user.id }));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});