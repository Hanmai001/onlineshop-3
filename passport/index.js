const passport = require('passport');
const LocalStrategy = require('passport-local');
const authService = require('../model/authService');

//Config localStrategy
passport.use(new LocalStrategy({ usernameField: 'username', passReqToCallback: true }, async function verify(req, username, password, cb) {
    const user = await authService.checkUserCredential(username, password);
    if (user)
        return cb(null, user);
    return cb(null, false, req.flash('loginMessage', 'Tên đăng nhập hoặc mật khẩu sai.'));
}));

//Add info user to session when authen success
passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        cb(null, { id: user.IDUSER, username: user.USERNAME, admin: user.ADMIN, ban: user.BAN });
    });
});

//Sau khi serializeUser hàm này sẽ lấy thông tin từ session và lưu vào biến req.user
passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});

module.exports = passport;