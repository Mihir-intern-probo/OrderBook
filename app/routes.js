const express = require("express");
const {dataController} = require('./controllers/dataSavingController.js');

const router = express.Router();

router.route('/dataSavingOrderBook').post(dataController.saveData);

module.exports = router;
