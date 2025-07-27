// src/middleware/auth.js
import jwt from "jsonwebtoken";

const validateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).send({
      status: false,
      message: "No token provided",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        status: false,
        message: "Invalid token",
      });
    }

    req.user = { userId: decoded.userId }; // you can add more if needed
    next();
  });
};

export default validateToken;
