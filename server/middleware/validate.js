const { validationResult } = require('express-validator');

/**
 * Middleware factory that runs express-validator chains
 * and standardizes error responses.
 */
const validate = (validations) => {
  return async (req, res, next) => {
    for (const validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(400).json({
      message: errors.array()[0].msg,
      errors: errors.array()
    });
  };
};

module.exports = validate;
