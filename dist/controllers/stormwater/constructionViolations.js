"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteViolation = exports.updateViolation = exports.getViolation = exports.getViolations = exports.createViolation = void 0;
const uuid_1 = require("uuid");
const async_1 = __importDefault(require("@middleware/async"));
const errorResponse_1 = require("@utils/errorResponse");
const stormwater_1 = require("@models/stormwater");
// @desc    Create construction violation
// @route   POST /api/v1/stormwater/violations
// @access  Private
exports.createViolation = (0, async_1.default)(async (req, res, next) => {
    const { date, siteId, details, complaintId } = req.body;
    const email = req.user?.email;
    const violation = await stormwater_1.ConstructionViolation.create({
        violationId: `violation-${(0, uuid_1.v4)()}`,
        date,
        siteId,
        details,
        complaintId,
        createdBy: email,
        updatedBy: email
    });
    if (!violation) {
        return next(new errorResponse_1.ErrorResponse("Unable to create construction violation", 500));
    }
    res.status(201).json({
        success: true,
        msg: "Violation Created",
        data: violation
    });
});
// @desc    Get violations
// @route   GET /api/v1/stormwater/violations
// @access  Private
exports.getViolations = (0, async_1.default)(async (req, res, next) => {
    const violations = await stormwater_1.ConstructionViolation.findAll({
        order: [[stormwater_1.Site, 'name', 'asc'], [stormwater_1.FollowUpDate, 'followUpDate', 'desc']],
        include: [
            { model: stormwater_1.Site },
            { model: stormwater_1.FollowUpDate }
        ]
    });
    res.status(200).json({
        success: true,
        data: violations
    });
});
// @desc    Get violation
// @route   GET /api/v1/stormwater/violations/:uuid
// @access  Private
exports.getViolation = (0, async_1.default)(async (req, res, next) => {
    const violation = await stormwater_1.ConstructionViolation.findOne({
        where: {
            uuid: req.params.uuid
        },
        order: [[stormwater_1.FollowUpDate, 'followUpDate', 'desc']],
        include: { model: stormwater_1.FollowUpDate }
    });
    if (!violation) {
        return next(new errorResponse_1.ErrorResponse(`Unable to return construction violation by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        data: violation
    });
});
// @desc    Update violation
// @route   PUT /api/v1/stormwater/violations/:uuid
// @access  Private
exports.updateViolation = (0, async_1.default)(async (req, res, next) => {
    const { date, siteId, details, enforcementAction, penaltyDate, penaltyAmount, penaltyDueDate, paymentReceived, swoDate, swoLiftedDate, compliance, closed } = req.body;
    const email = req.user?.email;
    const violation = await stormwater_1.ConstructionViolation.update({
        date,
        siteId,
        details,
        enforcementAction,
        penaltyDate: penaltyDate ?? null,
        penaltyAmount,
        penaltyDueDate: penaltyDueDate ?? null,
        paymentReceived: paymentReceived ?? null,
        swoDate: swoDate ?? null,
        swoLiftedDate: swoLiftedDate ?? null,
        compliance,
        closed,
        updatedBy: email,
    }, {
        where: {
            uuid: req.params.uuid
        },
        returning: true
    });
    const [affectedCount, affectedRows] = violation;
    if (affectedCount === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to update construction violation by uuid ${req.params.uuid}`, 500));
    }
    const data = affectedRows[0];
    res.status(200).json({
        success: true,
        msg: "Violation Updated",
        data
    });
});
// @desc    Delete violation
// @route   DELETE /api/v1/stormwater/violations/:uuid
// @access  Private
exports.deleteViolation = (0, async_1.default)(async (req, res, next) => {
    const result = await stormwater_1.ConstructionViolation.destroy({
        where: {
            uuid: req.params.uuid
        }
    });
    if (result === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to delete violation by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        msg: "Violation Deleted"
    });
});
//# sourceMappingURL=constructionViolations.js.map