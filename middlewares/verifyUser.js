const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports.verifyUser = async function verifyUser(req, res, next) {
  const token = req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(403).send("Unauthorized user.");
  }

  try {
    const jwtInfo = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(jwtInfo.userId);

    if (!user)
      return res.status(400).json({ message: "User not found", status: 400 });

    req.user = user;

    next();
  } catch (error) {
    res.status(400).send(error);
  }
};
