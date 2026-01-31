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
});