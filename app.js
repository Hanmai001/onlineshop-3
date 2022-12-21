const express = require('express');
const initUserRoute = require('./routes/user');
const initAdminRoute = require('./routes/admin');
const initApiRoute = require('./routes/auth');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const passport = require('./passport');
const flash = require('connect-flash');

require('dotenv').config();

const app = express();
//Lấy từ file .env
const port = process.env.PORT || 3000;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

//Cau hinh view engine = ejs
app.set("view engine", "ejs");
//Cho thg express bt tìm file ejs ở đâu
//Tức là các file ejs phải viết trong thư mục view engine này
app.set("views", "./views");

//middleware sử dụng kịch bản Passport, lấy thông tin user rồi gắn vào req.user
app.use(session({
    secret: 'very secret keyboard cat',
    resave: false,
    saveUninitialized: false,
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
//middleware giúp gắn kịch bản local vào route
app.use(passport.authenticate('session'));
app.use(logger('dev'));
app.use(cookieParser());

app.use(function (req, res, next) {
    res.locals.user = req.user;
    next();
});

initUserRoute(app);
initAdminRoute(app);
initApiRoute(app);


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
})

