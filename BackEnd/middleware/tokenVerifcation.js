import jwt from "jsonwebtoken";

export const tokenVerifcation = (req, res, next) => {
  const access_token = req.cookies.access_token;

  if (!access_token) {
    return res.status(401).json({ msg: "Not authorized" });
  }

  try {
    const decoded = jwt.verify(
      access_token,
      process.env.JWT_SECRET_KEY
    );

    req.user = { _id: decoded.userId };

    next();
  } catch (error) {
    return res.status(401).json({ msg: "Invalid token" });
  }
};

