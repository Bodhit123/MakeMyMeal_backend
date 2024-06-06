const express = require("express");
const router = express.Router();
const dateController = require("../controllers/Settings.Dates.Controller");
const {SettingValidationMiddleware} = require("../middlewares/validation")

router.route("/dates/get").get(dateController.getDisabledDates);
router.route("/dates/add").post(SettingValidationMiddleware,dateController.addDisabledDates);
router.route("/dates/remove/:id").delete(dateController.removeDisabledDates);
router.route("/dates/update/:id").put(dateController.updateDisabledDates);

module.exports = router;
