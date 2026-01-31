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

  test('rejects when product is unpublished', async () => {
    req.body.productId = 'p2';
    req.body.quantity = 1;
    Product.findById.mockResolvedValue({ _id: 'p2', published: false, availableUnits: 5 });
    await quotationController.createQuotation(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('rejects when requested quantity exceeds availability', async () => {
    req.body.productId = 'p3';
    req.body.quantity = 3;
    Product.findById.mockResolvedValue({ _id: 'p3', published: true, availableUnits: 2 });
    await quotationController.createQuotation(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});