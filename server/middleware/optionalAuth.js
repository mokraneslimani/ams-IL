const jwt = require("jsonwebtoken");

/**
 * Optional auth middleware:
 * if Authorization: Bearer <token> exists, attaches req.userId.
 * Otherwise, continues without error.
 */
module.exports = function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [, token] = authHeader.split(" ");

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
  } catch (err) {
    // Ignore invalid token for optional auth
  }

  return next();
};
