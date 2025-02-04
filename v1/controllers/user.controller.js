const md5 = require("md5");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const generateHelper = require("../../helpers/generate.helper");
const sendEmailHelper = require("../../helpers/sendEmail.helper");
const ForgotPassword = require("../models/forgot-password.model");

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

// [POST] /api/v1/users/password/forgot
module.exports.passwordForgot = async (req, res) => {
  const email = req.body.email;

  const existUser = await User.findOne({
    email: email,
    deleted: false
  });

  if(!existUser) {
    res.json({
      code: 400,
      message: "Email không tồn tại!"
    });
    return;
  }

  const otp = generateHelper.generateRandomNumber(6);

  const objectForgotPassword = {
    email: email,
    otp: otp,
    expireAt: Date.now() + 3*60*1000
  };

  const forgotPassword = new ForgotPassword(objectForgotPassword);
  await forgotPassword.save();

  const subject = "Lấy lại mật khẩu.";
  const text = `Mã OTP xác thực tài khoản của bạn là: ${otp}. Mã OTP có hiệu lực trong vòng 3 phút. Vui lòng không cung cấp mã OTP này với bất kỳ ai.`;
  sendEmailHelper.sendEmail(email, subject, text);

  res.json({
    code: 200,
    message: "Đã gửi mã OTP qua email!"
  });
}

// [POST] /api/v1/users/password/otp
module.exports.passwordOtp = async (req, res) => {
  const email = req.body.email;
  const otp = req.body.otp;

  const result = await ForgotPassword.findOne({
    email: email,
    otp: otp
  });

  if(!result) {
    res.json({
      code: 400,
      message: "OTP không hợp lệ"
    });
    return;
  }

  const user = await User.findOne({
    email: email
  });

  const token = jwt.sign({id: user.id}, process.env.JWT_KEY, {
    expiresIn: "30m"
  });

  res.json({
    code: 200,
    token: token,
    message: "Xác thực thành công!"
  });
};

// [POST] /api/v1/users/password/reset
module.exports.resetPassword = async (req, res) => {
  try {
    const token = req.body.token;
    const password = req.body.password;

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const userId = decoded.id;

    await User.updateOne({
      _id: userId
    }, {
      password: md5(password)
    });

    res.json({
      code: 200,
      message: "Đổi mật khẩu thành công!"
    });

  } catch (error) {
    res.json({
      code: 400,
      message: "Đổi mật khẩu không thành công"
    })
  }
}