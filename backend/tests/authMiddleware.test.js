const { authorize } = require('../middleware/auth');

describe('authorize middleware', () => {
  test('allows user with required role', () => {
    const req = { user: { role: 'provider' } };
    const res = {};
    const next = jest.fn();

    const middleware = authorize('provider', 'admin');
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('blocks user without required role', () => {
    const req = { user: { role: 'renter' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    const middleware = authorize('provider', 'admin');
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    expect(next).not.toHaveBeenCalled();
  });
});