const errorHandler = require('../middleware/errorHandler');

describe('errorHandler middleware', () => {
  test('handles TokenExpiredError correctly', () => {
    const err = new Error('jwt expired');
    err.name = 'TokenExpiredError';

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    errorHandler(err, {}, res, () => {});

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, code: 'TOKEN_EXPIRED' }));
  });
});