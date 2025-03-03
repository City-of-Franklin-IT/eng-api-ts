"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLog = exports.updateLog = exports.getLog = exports.createLog = void 0;
const uuid_1 = require("uuid");
const async_1 = __importDefault(require("@middleware/async"));
const errorResponse_1 = require("@utils/errorResponse");
const stormwater_1 = require("@models/stormwater");
// @desc    Create log
// @route   POST /api/v1/stormwater/logs
// @access  Private
exports.createLog = (0, async_1.default)(async (req, res, next) => {
    const { siteId, inspectionDate } = req.body;
    const email = req.user?.email;
    const log = await stormwater_1.Log.create({
        logId: `log-${(0, uuid_1.v4)()}`,
        siteId,
        inspectionDate,
        createdBy: email,
        updatedBy: email,
    });
    if (!log) {
        return next(new errorResponse_1.ErrorResponse("Unable to create new site log", 500));
    }
    res.status(201).json({
        success: true,
        msg: "Site Log Created",
        data: log
    });
});
//@desc    Get log
//@route   GET /api/v1/stormwater/logs/:uuid
//@access  Private
exports.getLog = (0, async_1.default)(async (req, res, next) => {
    const log = await stormwater_1.Log.findOne({
        where: {
            uuid: req.params.uuid
        }
    });
    if (!log) {
        return next(new errorResponse_1.ErrorResponse(`Unable to return site log by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        data: log
    });
});
// @desc    Update log
// @route   PUT /api/v1/stormwater/logs/:uuid
// @access  Private
exports.updateLog = (0, async_1.default)(async (req, res, next) => {
    const { inspectionDate } = req.body;
    const email = req.user?.email;
    const log = await stormwater_1.Log.update({
        inspectionDate,
        updatedBy: email
    }, {
        where: {
            uuid: req.params.uuid
        },
        returning: true
    });
    const [affectedCount, affectedRows] = log;
    if (affectedCount === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to update log by uuid ${req.params.uuid}`, 500));
    }
    const data = affectedRows[0];
    res.status(200).json({
        success: true,
        msg: "Site Log Updated",
        data
    });
});
// @desc    Delete log
// @route   DELETE /api/v1/stormwater/logs/:uuid
// @access  Private
exports.deleteLog = (0, async_1.default)(async (req, res, next) => {
    const result = await stormwater_1.Log.destroy({
        where: {
            uuid: req.params.uuid
        }
    });
    if (result === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to delete site log by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        msg: "Site Log Deleted"
    });
});
//# sourceMappingURL=logs.js.map