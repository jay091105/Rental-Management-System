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

  test('provider-created products default to published', async () => {
    req.user.role = 'provider';
    req.body = {
      title: 'Prov',
      description: 'desc',
      category: 'Other',
      location: 'loc',
      pricePerDay: 50
    };
    Product.create.mockResolvedValue({ _id: 'p2', ...req.body, published: true });

    await productController.createProduct(req, res);

    expect(Product.create).toHaveBeenCalledWith(expect.objectContaining({ owner: req.user.id, published: true }));
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('getProducts defaults to published and available units > 0', async () => {
    const req2 = { query: {} };
    const res2 = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    Product.countDocuments = jest.fn().mockResolvedValue(0);
    Product.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([])
    });

    await productController.getProducts(req2, res2);

    expect(Product.find).toHaveBeenCalledWith(expect.objectContaining({ published: true, availableUnits: { $gt: 0 } }));
    expect(res2.status).toHaveBeenCalledWith(200);
  });

  test('non-admin cannot set published when updating', async () => {
    const req = { params: { id: 'p1' }, body: { title: 'New Title', published: true }, user: { id: 'user1', role: 'provider' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    Product.findById.mockResolvedValue({ _id: 'p1', owner: 'user1' });
    Product.findByIdAndUpdate = jest.fn().mockResolvedValue({ _id: 'p1', title: 'New Title', published: false });

    await productController.updateProduct(req, res);

    expect(Product.findByIdAndUpdate).toHaveBeenCalledWith('p1', expect.not.objectContaining({ published: true }), expect.any(Object));
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('admin can set published when updating', async () => {
    const req = { params: { id: 'p2' }, body: { title: 'Admin Title', published: true }, user: { id: 'uadmin', role: 'admin' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    Product.findById.mockResolvedValue({ _id: 'p2', owner: 'someone' });
    Product.findByIdAndUpdate = jest.fn().mockResolvedValue({ _id: 'p2', title: 'Admin Title', published: true });

    await productController.updateProduct(req, res);

    expect(Product.findByIdAndUpdate).toHaveBeenCalledWith('p2', expect.objectContaining({ published: true }), expect.any(Object));
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('owner can view unpublished product', async () => {
    const req = { params: { id: 'p3' }, user: { id: 'owner1' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    Product.findById.mockResolvedValue({ _id: 'p3', published: false, owner: 'owner1' });

    await productController.getProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('unauthenticated user cannot view unpublished product', async () => {
    const req = { params: { id: 'p4' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    Product.findById.mockResolvedValue({ _id: 'p4', published: false, owner: 'owner1' });

    await productController.getProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('getAvailability returns product.availableUnits when no dates provided', async () => {
    Product.findById.mockResolvedValue({ _id: 'p1', availableUnits: 5 });
    const req = { params: { id: 'p1' }, query: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await productController.getAvailability(req, res);
    expect(Product.findById).toHaveBeenCalledWith('p1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: { availableUnits: 5 } }));
  });

  test('getAvailability returns adjusted availability when reservedQuantity reports reservations', async () => {
    const req = { params: { id: 'p2' }, query: { start: '2026-04-01', end: '2026-04-05' } };
    Product.findById.mockResolvedValue({ _id: 'p2', availableUnits: 4 });

    // mock the availability util
    jest.mock('../utils/availability', () => ({ reservedQuantity: jest.fn().mockResolvedValue(2) }));
    const availability = require('../utils/availability');
    availability.reservedQuantity.mockResolvedValue(2);

    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await productController.getAvailability(req, res);

    expect(availability.reservedQuantity).toHaveBeenCalledWith('p2', '2026-04-01', '2026-04-05');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: { availableUnits: 2, reserved: 2 } }));
  });
});