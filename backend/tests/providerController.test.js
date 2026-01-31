const providerController = require('../controllers/providerController');
const Product = require('../models/Product');

jest.mock('../models/Product');

describe('providerController.getProducts', () => {
  beforeEach(() => {
    Product.find.mockReset();
  });

  test('returns products belonging to provider', async () => {
    const req = { user: { id: 'prov1' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    Product.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([{ _id: 'p1', owner: 'prov1' }, { _id: 'p2', owner: 'prov1' }]) });

    await providerController.getProducts(req, res);

    expect(Product.find).toHaveBeenCalledWith({ owner: 'prov1' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, count: 2 }));
  });

  test('includes unpublished products', async () => {
    const req = { user: { id: 'prov2' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    Product.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([{ _id: 'p3', owner: 'prov2', published: false }]) });

    await providerController.getProducts(req, res);

    expect(Product.find).toHaveBeenCalledWith({ owner: 'prov2' });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, count: 1 }));
  });
});