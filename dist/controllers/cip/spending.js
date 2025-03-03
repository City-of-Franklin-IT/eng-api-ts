"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSpending = exports.createSpending = void 0;
const async_1 = __importDefault(require("@middleware/async"));
const errorResponse_1 = require("@utils/errorResponse");
const cip_1 = require("@models/cip");
//@desc    Create spending
//@route   POST /api/v1/eng/cip/spending
//@access  Private
exports.createSpending = (0, async_1.default)(async (req, res, next) => {
    const { dollarsSpent, parentId } = req.body;
    const email = req.user?.email;
    const spending = await cip_1.Spending.create({
        dollarsSpent,
        dollarsSpentDate: new Date(),
        parentId,
        createdBy: email,
        updatedBy: email
    });
    if (!spending) {
        return next(new errorResponse_1.ErrorResponse('Could not create new spending', 500));
    }
    res.status(201).json({
        success: true,
        msg: "Spending Created"
    });
});
//@desc    Delete spending
//@route   DELETE /api/v1/eng/cip/spending/:uuid
//@access  Private
exports.deleteSpending = (0, async_1.default)(async (req, res, next) => {
    await cip_1.Spending.destroy({
        where: {
            uuid: req.params.uuid
        }
    });
    res.status(200).json({
        success: true,
        msg: "Spending Deleted"
    });
});
//# sourceMappingURL=spending.js.map