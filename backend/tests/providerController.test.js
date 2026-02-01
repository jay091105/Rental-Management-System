const providerController = require('../controllers/providerController');
const Product = require('../models/Product');
const User = require('../models/User');

jest.mock('../models/Product');
jest.mock('../models/User');

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

  test('deactivateProvider disables provider and unpublishes products', async () => {
    const req = { params: { id: 'provX' }, user: { id: 'provX', role: 'provider' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    const userDoc = { _id: 'provX', role: 'provider', isActive: true, save: jest.fn().mockResolvedValue(true) };
    User.findById = jest.fn().mockResolvedValue(userDoc);
    Product.updateMany = jest.fn().mockResolvedValue({ nModified: 2 });

    await providerController.deactivateProvider(req, res);

    expect(User.findById).toHaveBeenCalledWith('provX');
    expect(userDoc.isActive).toBe(false);
    expect(Product.updateMany).toHaveBeenCalledWith({ owner: 'provX' }, expect.objectContaining({ $set: expect.objectContaining({ published: false, ownerActive: false }) }));
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('reactivateProvider restores products that were owner-disabled', async () => {
    const req = { params: { id: 'provY' }, user: { id: 'provY', role: 'provider' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    const userDoc = { _id: 'provY', role: 'provider', isActive: false, save: jest.fn().mockResolvedValue(true) };
    User.findById = jest.fn().mockResolvedValue(userDoc);
    Product.updateMany = jest.fn().mockResolvedValue({ nModified: 3 });

    await providerController.reactivateProvider(req, res);

    expect(User.findById).toHaveBeenCalledWith('provY');
    expect(userDoc.isActive).toBe(true);
    expect(Product.updateMany).toHaveBeenCalledWith({ owner: 'provY', ownerDisabledAt: { $ne: null } }, expect.any(Object));
    expect(res.status).toHaveBeenCalledWith(200);
  });
});