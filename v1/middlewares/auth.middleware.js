const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

module.exports.requireAuth = async (req, res, next) => {
  if(!req.headers.authorization){
    res.json({
      code: 400,
      message: "Vui lòng gửi kèm token"
    });
    return;
  }

  const token = req.headers.authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    
    const user = await User.findOne({
      _id: decoded.id,
      deleted: false
    }).select("fullName email");

    res.locals.user = user;
    next();
  } catch (error) {
    res.json({
      code: 400,
      message: "Token không hợp lệ"
    });
    return;
  }
}