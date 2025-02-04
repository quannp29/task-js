const md5 = require("md5");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

// [POST] /api/v1/users/register
module.exports.register = async (req, res) => {
  const existEmail = await User.findOne({
    email: req.body.email,
    deleted: false
  });

  if(existEmail){
    res.json({
      code: 400,
      message: "Email đã tồn tại"
    });
    return;
  }

  const dataUser = {
    fullName: req.body.fullName,
    email: req.body.email,
    password: md5(req.body.password)
  };

  const user = new User(dataUser);
  await user.save();

  res.json({
    code: 200,
    message: "Đăng ký tài khoản thành công!",
  });
}

// [POST] /api/v1/users/login
module.exports.login = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const existUser = await User.findOne({
    email: email,
    deleted: false
  });

  if(!existUser) {
    res.json({
      code: 400,
      message: "Email hoặc mật khẩu không đúng!"
    });
    return;
  }
  
  if(md5(password) != existUser.password) {
    res.json({
      code: 400,
      message: "Email hoặc mật khẩu không đúng!"
    });
    return;
  }

  const token = jwt.sign({id: existUser.id}, process.env.JWT_KEY, {
    expiresIn: "1d"
  });

  res.json({
    code: 200,
    message: "Đăng nhập thành công!",
    token: token
  });
}