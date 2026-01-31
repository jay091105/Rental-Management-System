const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth');

jest.mock('jsonwebtoken');

describe('protect middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  test('returns 401 when no token provided', async () => {
    await protect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 and TOKEN_EXPIRED when token is expired', async () => {
    req = { headers: { authorization: 'Bearer fake.token.here' } };
    jwt.verify.mockImplementation(() => { const err = new Error('jwt expired'); err.name = 'TokenExpiredError'; throw err; });

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, code: 'TOKEN_EXPIRED' }));
    expect(next).not.toHaveBeenCalled();
  });
});