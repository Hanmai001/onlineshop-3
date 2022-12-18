const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const appRoot = require('app-root-path');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const passport = require('../passport');

//Middleware
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, appRoot + '/public/images');
    },

    // By default, multer removes file extensions so let's add them back
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

//Ham để check file
const imageFilter = function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(null, false);
    }
    cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: imageFilter });

//Khoi tao web router
const initUserRoute = (app) => {
    router.use((req, res, next) => {
        res.locals.flashMessages = req.flash();
        next();
    });
    //<=> route.get('/', (req, res) => {res.render('index.ejs)})
    router.get('/', authController.isLoggedCustomer, userController.getHomepage);
    //truyền thso vào url
    router.get('/products/details/:id', authController.isLoggedCustomer, userController.getDetailProductPage);
    router.get('/list-order', authController.isLoggedCustomer, userController.getListOrderPage);
    router.get('/my-profile/:id', authController.isLoggedCustomer, userController.getProfilePage);
    router.get('/change-password/:id', authController.isLoggedCustomer, userController.getUpdatePasswordPage);
    router.get('/list-orders-status/:id', authController.isLoggedCustomer, userController.getListOrderStatusPage);
    router.get('/payment', authController.isLoggedCustomer, userController.getPaymentPage);
    router.post('/register', authController.handleRegister);

    router.post('/login', passport.authenticate("local",
        {
            failureRedirect: "/",
        }), (req, res) => {
            if (req.user.ADMIN == '1') {
                res.redirect('/static');
            }
            else
                res.redirect('/');
        });
    router.get('/logout', authController.logout);
    router.post('/my-profile/:id/update-info', upload.single('update-ava'), userController.updateInformation);
    router.post('/change-password/:id/update-password', userController.updatePassword);
    //Web của ta bđau = '/', truyền router vào
    return app.use('/', router);
}

module.exports = initUserRoute;

