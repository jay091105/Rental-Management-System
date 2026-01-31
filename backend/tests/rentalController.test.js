const rentalController = require('../controllers/rentalController');
const Rental = require('../models/Rental');
const Product = require('../models/Product');

jest.mock('../models/Rental');
jest.mock('../models/Product');

describe('rentalController.createRental', () => {
  let req, res;
  beforeEach(() => {
    req = { body: {}, user: { _id: 'u1' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    Rental.find.mockReset();
    Rental.create.mockReset();
    Product.findById.mockReset();
  });

  test('rejects invalid dates', async () => {
    req.body = { productId: 'p1', startDate: '2026-02-10', endDate: '2026-02-05' };
    await rentalController.createRental(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('rejects when insufficient units due to existing reservations', async () => {
    req.body = { productId: 'p1', startDate: '2026-02-02', endDate: '2026-02-05', quantity: 2 };
    Product.findById.mockResolvedValue({ _id: 'p1', availableUnits: 2, pricePerDay: 10, published: true });
    // existing overlapping rental with quantity 1
    Rental.find.mockResolvedValue([{ quantity: 1 }]);

    await rentalController.createRental(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  test('rejects when product is unpublished', async () => {
    req.body = { productId: 'p2', startDate: '2026-02-02', endDate: '2026-02-05', quantity: 1 };
    Product.findById.mockResolvedValue({ _id: 'p2', availableUnits: 2, pricePerDay: 10, published: false });

    await rentalController.createRental(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('creates rental when ok', async () => {
    req.body = { productId: 'p1', startDate: '2026-02-02', endDate: '2026-02-05', quantity: 1 };
    Product.findById.mockResolvedValue({ _id: 'p1', availableUnits: 2, pricePerDay: 10 });
    Rental.find.mockResolvedValue([]);
    Rental.create.mockResolvedValue({ _id: 'r1', product: 'p1', user: 'u1', startDate: new Date('2026-02-02'), endDate: new Date('2026-02-05'), quantity: 1, totalCost: 30, rentalStatus: 'pending', populate: jest.fn().mockResolvedValue({}) });

    await rentalController.createRental(req, res);
    expect(Rental.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

describe('rentalController.updateStatus transitions', () => {
  let req, res;
  beforeEach(() => {
    req = { params: {}, body: {}, user: { id: 'u1', role: 'provider' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    Rental.findById.mockReset();
  });

  test('rejects invalid transition', async () => {
    const rental = { _id: 'r1', rentalStatus: 'completed', product: { owner: 'u1', availableUnits: 1 }, quantity:1, save: jest.fn() };
    Rental.findById.mockResolvedValue(rental);
    req.params.id = 'r1'; req.body.status = 'approved';

    await rentalController.updateStatus(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});