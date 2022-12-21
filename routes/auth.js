const express = require('express');
const router = express.Router();

const apiController = require('../controllers/apiController');

const initApiRoute = (app) => {
    router.get('/api/verify-username/:username', apiController.verifyUsername);
    router.get('/api/verify-email/:email', apiController.verifyEmail);

    return app.use('/', router);
}

module.exports = initApiRoute;