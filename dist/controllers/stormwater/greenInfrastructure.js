"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGreenInfrastructure = exports.updateGreenInfrastructure = exports.getGreenInfrastructure = exports.getGreenInfrastructures = exports.createGreenInfrastructure = void 0;
const uuid_1 = require("uuid");
const async_1 = __importDefault(require("@middleware/async"));
const errorResponse_1 = require("@utils/errorResponse");
const stormwater_1 = require("@models/stormwater");
const emailInspector_1 = require("@utils/automatedEmails/emailInspector");
// @desc    Create green infrastructure violation
// @route   POST /api/v1/stormwater/greeninfrastructure
// @access  Private
exports.createGreenInfrastructure = (0, async_1.default)(async (req, res, next) => {
    const { date, xCoordinate, yCoordinate, locationDescription, inspectorId, details, comments, responsibleParty, enforcementAction, penaltyDate, penaltyAmount, penaltyDueDate, paymentReceived } = req.body;
    const production = process.env.NODE_ENV === 'production';
    const email = req.user?.email;
    const green = await stormwater_1.GreenInfrastructure.create({
        greenId: `green-${(0, uuid_1.v4)()}`,
        date,
        xCoordinate,
        yCoordinate,
        locationDescription,
        inspectorId,
        details,
        comments,
        responsibleParty,
        enforcementAction,
        penaltyDate,
        penaltyAmount,
        penaltyDueDate,
        paymentReceived,
        createdBy: email,
        updatedBy: email,
    });
    if (!green) {
        return next(new errorResponse_1.ErrorResponse("Could not create green infrastructure violation", 500));
    }
    if (inspectorId && production) { // If inspector assigned - email inspector
        const inspector = await stormwater_1.Inspector.findOne({
            where: {
                inspectorId
            },
            attributes: ['email']
        });
        if (inspector) {
            await (0, emailInspector_1.emailInspector)(inspector.email, { uuid: green.uuid, greenId: green.greenId, details: green.details });
        }
    }
    res.status(201).json({
        success: true,
        msg: "Green Infrastructure Violation Created",
        data: green
    });
});
// @desc    Get green infrastructure violations
// @route   GET /api/v1/stormwater/greeninfrastructure
// @access  Private
exports.getGreenInfrastructures = (0, async_1.default)(async (req, res, next) => {
    const greenViolations = await stormwater_1.GreenInfrastructure.findAll({
        order: [['date', 'desc'], [stormwater_1.FollowUpDate, 'followUpDate', 'desc']],
        include: { model: stormwater_1.FollowUpDate }
    });
    res.status(200).json({
        success: true,
        data: greenViolations
    });
});
// @desc    Get green infrastructure
// @route   GET /api/v1/stormwater/greeninfrastructure/:uuid
// @access  Private
exports.getGreenInfrastructure = (0, async_1.default)(async (req, res, next) => {
    const green = await stormwater_1.GreenInfrastructure.findOne({
        where: {
            uuid: req.params.uuid
        },
        order: [[stormwater_1.FollowUpDate, 'followUpDate', 'desc']],
        include: { model: stormwater_1.FollowUpDate }
    });
    if (!green) {
        return next(new errorResponse_1.ErrorResponse(`Unable to return green infrastructure violation by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        data: green
    });
});
// @desc    Update green infrastructure violation
// @route   PUT /api/v1/stormwater/greeninfrastructure/:uuid
// @access  Private
exports.updateGreenInfrastructure = (0, async_1.default)(async (req, res, next) => {
    const { date, xCoordinate, yCoordinate, locationDescription, inspectorId, details, comments, responsibleParty, enforcementAction, penaltyDate, penaltyAmount, penaltyDueDate, paymentReceived, bondReleased, compliance, closed } = req.body;
    const production = process.env.NODE_ENV === 'production';
    const email = req.user?.email;
    const inspectorEmail = await (0, emailInspector_1.inspectorLookup)(req.params.uuid, stormwater_1.GreenInfrastructure, inspectorId);
    const green = await stormwater_1.GreenInfrastructure.update({
        date,
        xCoordinate,
        yCoordinate,
        locationDescription,
        inspectorId,
        details,
        comments,
        responsibleParty,
        enforcementAction,
        penaltyDate,
        penaltyAmount,
        penaltyDueDate,
        paymentReceived,
        bondReleased,
        compliance,
        closed,
        updatedBy: email,
    }, {
        where: {
            uuid: req.params.uuid
        },
        returning: true
    });
    const [affectedCount, affectedRows] = green;
    if (affectedCount === 0) {
        return next(new errorResponse_1.ErrorResponse(`Could not update green infrastructure with uuid ${req.params.uuid}`, 500));
    }
    const data = affectedRows[0];
    if (inspectorEmail && inspectorId && production) { // If inspector assigned - email inspector
        await (0, emailInspector_1.emailInspector)(inspectorEmail.email, { uuid: data.uuid, greenId: data.greenId, details: data.details });
    }
    res.status(200).json({
        success: true,
        msg: "Violation Updated",
        data
    });
});
// @desc    Delete green infrastructure violation
// @route   DELETE /api/v1/stormwater/greeninfrastructure/:uuid
// @access  Private
exports.deleteGreenInfrastructure = (0, async_1.default)(async (req, res, next) => {
    const result = await stormwater_1.GreenInfrastructure.destroy({
        where: {
            uuid: req.params.uuid
        }
    });
    if (result === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to delete green infrastructure by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        msg: "Violation Deleted"
    });
});
//# sourceMappingURL=greenInfrastructure.js.map