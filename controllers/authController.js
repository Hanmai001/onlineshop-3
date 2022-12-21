const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const authService = require('../model/authService');
const registerSchema = require('../schemas/register')

const ajv = new Ajv();
//Format cho schema
addFormats(ajv);

let isLoggedAdmin = async (req, res, next) => {
    if (req.isAuthenticated() && req.session.passport.user.admin == '1') {
        return next();
    } else {
        return res.send('Bạn không có quyền truy cập');
    }
}
let isLoggedCustomer = async (req, res, next) => {
    if (req.isAuthenticated() && req.session.passport.user.admin == '0') {
        return next();
    } else if (req.isUnauthenticated()) {
        return next();
    }
    else
        return res.send("Bạn đang là Admin trang web");
}
let handleRegister = async (req, res, next) => {
    // syntax validation
    //console.log(req.body)
    if (!ajv.validate(registerSchema, req.body)) {
        req.flash('registerMessage', 'Vui lòng kiểm tra lại thông tin đăng kí')
        return res.redirect('/');
    }
    const { username, email, password, confirmPassword } = req.body;
    if (username.length < 6) {
        req.flash('registerMessage', 'Username phải có ít nhất 6 ký tự ')
        return res.redirect('/');
    }
    if (password.length < 6) {
        req.flash('registerMessage', 'Mật khẩu phải có ít nhất 6 ký tự ')
        return res.redirect('/');
    }
    if (password !== confirmPassword) {
        req.flash('registerMessage', 'Mật khẩu không trùng')
        return res.redirect('/');
    }
    if (!(/[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password))) {
        req.flash('registerMessage', 'Mật khẩu phải có ít nhất 1 kí tự thường, 1 kí tự hoa và số')
        return res.redirect('/');
    }
    const result = await authService.register(username, email, password);
    if (result) {
        req.flash('registerMessage', result)
        return res.redirect('/');
    }
    next();
}
let logout = (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.session.destroy();
        res.redirect('/');
    });
};



module.exports = {
    handleRegister,
    logout,
    isLoggedAdmin,
    isLoggedCustomer,
}