const reviewController = require('../controllers/reviewController');
const Review = require('../models/Review');
const Rental = require('../models/Rental');

jest.mock('../models/Review');
jest.mock('../models/Rental');

describe('reviewController.addReview', () => {
  let req, res;
  beforeEach(() => {
    req = { body: {}, user: { id: 'u1' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    Rental.findOne.mockReset();
    Review.findOne.mockReset();
    Review.create.mockReset();
  });

  test('blocks review when no completed rental', async () => {
    req.body = { productId: 'p1', rating: 5, comment: 'Nice' };
    Rental.findOne.mockResolvedValue(null);

    await reviewController.addReview(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});