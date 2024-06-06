const express = require('express');
const router = express.Router();
const { getDisabledDates } = require('../middlewares/getDisabledDates');
const  getDisabledDatesArray = require('../controllers/disabledDatesController');

// Define the route with the middleware and controller
router.get('/disabled-dates', getDisabledDates, getDisabledDatesArray);

module.exports = router;
