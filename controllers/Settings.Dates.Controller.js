const DisableDateModel = require("../models/disable.model.js");
const { successResponse, errorResponse } = require("../utils/apiResponse");

exports.getDisabledDates = async (req, res) => {
  try {
    const DisabledDateObjects = await DisableDateModel.find({});
    successResponse(res, DisabledDateObjects, "fetched disabled Dates", 200);
  } catch (error) {
    console.log(error);
    errorResponse(res, error.message, 400);
  }
};

exports.addDisabledDates = async (req, res) => {
  try {
    const { Dates, Reason, MealType } = req.body;
    console.log(req.body);
    const isExist = await DisableDateModel.findOne({
      $or: [
        {
          $and: [
            { "Dates.from": { $lte: Dates.startDate } },
            { "Dates.to": { $gte: Dates.endDate } },
          ],
        },
        {
          $and: [
            { "Dates.from": { $gte: Dates.startDate, $lte: Dates.endDate } },
            { "Dates.to": { $gte: Dates.startDate, $lte: Dates.endDate } },
          ],
        },
      ],
    });

    if (isExist) {
      return errorResponse(res, "disable dates already exist", 409);
    }

    const setting = await new DisableDateModel({
      Dates: {
        from: Dates.startDate,
        to: Dates.endDate,
      },
      Reason,
      MealType,
    }).save();
    console.log("setting", setting);
    successResponse(res, { setting }, "Dates added successfully", 201);
  } catch (error) {
    console.log(error);
    errorResponse(res, error.message, 400);
  }
};

exports.removeDisabledDates = async (req, res) => {
  try {
    const { id } = req.params;
    //if employee with id exist or not
    const obj = await DisableDateModel.findById(id);

    if (!obj) {
      return errorResponse(res, "Dates not found", 404);
    }

    await obj.deleteOne();

    successResponse(res, obj, "Dates deleted successfully", 200);
  } catch (error) {
    console.log(error);
    errorResponse(res, error.message, 400);
  }
};

exports.updateDisabledDates = async (req, res) => {
  try {
    const { id } = req.params;
    const { Dates, ...rest } = req.body;

    const DisableDocument = await DisableDateModel.findById(id);

    if (!DisableDocument) {
      return errorResponse(res, "Disable Dates document not found", 404);
    }
    console.log(DisableDocument);
    console.log(req.body);
    Object.assign(DisableDocument, {
      Dates: {
        from: Dates.startDate,
        to: Dates.endDate,
      },
      ...rest,
    });
    //save updates
    await DisableDocument.save();

    successResponse(
      res,
      { DisableDocument },
      "document updated successfully",
      200
    );
  } catch (error) {
    console.log(error);
    errorResponse(res, error.message, 400);
  }
};
