// Simple ownership middleware
module.exports = function ensureOwnership(modelName, idParam = 'id') {
  return async (req, res, next) => {
    try {
      const Model = require(`../models/${modelName}`);
      const resource = await Model.findById(req.params[idParam]);

      if (!resource) {
        return res.status(404).json({ success: false, message: `${modelName} not found` });
      }

      // If resource has an owner field, check ownership
      if (resource.owner && resource.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to modify this resource' });
      }

      // Attach loaded resource to request for controller reuse
      req.resource = resource;

      next();
    } catch (err) {
      console.error('Ownership middleware error:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };
};