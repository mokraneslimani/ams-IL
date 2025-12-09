const jwt = require("jsonwebtoken");

/**
 * Middleware simple pour vérifier le JWT et attacher userId à req.
 * Attend un header Authorization: Bearer <token>.
 */
module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [, token] = authHeader.split(" ");

  if (!token) {
    return res.status(401).json({ message: "Token manquant" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalide" });
  }
};
