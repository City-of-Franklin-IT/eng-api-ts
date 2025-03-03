"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteIllicitDischarge = exports.updateIllicitDischarge = exports.getIllicitDischarge = exports.getIllicitDischarges = exports.createIllicitDischarge = void 0;
const uuid_1 = require("uuid");
const async_1 = __importDefault(require("@middleware/async"));
const errorResponse_1 = require("@utils/errorResponse");
const stormwater_1 = require("@models/stormwater");
const emailInspector_1 = require("@utils/automatedEmails/emailInspector");
// @desc    Create illicit discharge
// @route   POST /api/v1/stormwater/illicit-discharges/create
// @access  Private
exports.createIllicitDischarge = (0, async_1.default)(async (req, res, next) => {
    const { complaintId, siteId, date, xCoordinate, yCoordinate, locationDescription, inspectorId, details, responsibleParty, volumeLost, streamWatershed, otherStreamWatershed, enforcementAction, penaltyDate, penaltyAmount, penaltyDueDate, paymentReceived } = req.body;
    const production = process.env.NODE_ENV === 'production';
    const email = req.user?.email;
    const illicit = await stormwater_1.IllicitDischarge.create({
        illicitId: `illicit-${(0, uuid_1.v4)()}`,
        complaintId,
        siteId,
        date: new Date(date),
        xCoordinate,
        yCoordinate,
        locationDescription,
        inspectorId,
        details,
        responsibleParty,
        volumeLost,
        streamWatershed: otherStreamWatershed ? otherStreamWatershed : streamWatershed,
        enforcementAction,
        penaltyDate,
        penaltyAmount,
        penaltyDueDate,
        paymentReceived,
        createdBy: email,
        updatedBy: email
    });
    if (!illicit) {
        return next(new errorResponse_1.ErrorResponse("Unable to create illicit discharge", 500));
    }
    if (inspectorId && production) { // If inspector assigned - email inspector
        const inspector = await stormwater_1.Inspector.findOne({
            where: {
                inspectorId
            },
            attributes: ['email']
        });
        if (inspector) {
            await (0, emailInspector_1.emailInspector)(inspector.email, { uuid: illicit.uuid, details: illicit.details });
        }
    }
    res.status(201).json({
        success: true,
        msg: "Illicit Discharge Created",
        data: illicit
    });
});
// @desc    Get illicit discharges - no associated site
// @route   GET /api/v1/stormwater/illicitdischarges
// @access  Private
exports.getIllicitDischarges = (0, async_1.default)(async (req, res, next) => {
    const illicitDischarges = await stormwater_1.IllicitDischarge.findAll({
        where: {
            siteId: null
        },
        order: [['date', 'desc'], [stormwater_1.FollowUpDate, 'followUpDate', 'desc']],
        include: [
            { model: stormwater_1.FollowUpDate }
        ]
    });
    res.status(200).json({
        success: true,
        data: illicitDischarges
    });
});
// @desc    Get illicit discharge
// @route   GET /api/v1/stormwater/illicit-discharges/:uuid
// @access  Private
exports.getIllicitDischarge = (0, async_1.default)(async (req, res, next) => {
    const illicit = await stormwater_1.IllicitDischarge.findOne({
        where: {
            uuid: req.params.uuid
        },
        order: [[stormwater_1.FollowUpDate, 'followUpDate', 'desc']],
        include: {
            model: stormwater_1.FollowUpDate
        }
    });
    if (!illicit) {
        return next(new errorResponse_1.ErrorResponse(`Unable to return illicit discharge by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        data: illicit
    });
});
// @desc    Update illicit discharge
// @route   PUT /api/v1/stormwater/illicit-discharges/:uuid
// @access  Private
exports.updateIllicitDischarge = (0, async_1.default)(async (req, res, next) => {
    const { date, xCoordinate, yCoordinate, locationDescription, inspectorId, details, responsibleParty, volumeLost, streamWatershed, otherStreamWatershed, enforcementAction, penaltyDate, penaltyAmount, penaltyDueDate, paymentReceived, compliance, closed } = req.body;
    const production = process.env.NODE_ENV === 'production';
    const email = req.user?.email;
    const inspectorEmail = await (0, emailInspector_1.inspectorLookup)(req.params.uuid, stormwater_1.IllicitDischarge, inspectorId);
    const illicit = await stormwater_1.IllicitDischarge.update({
        date,
        xCoordinate,
        yCoordinate,
        locationDescription,
        inspectorId,
        details,
        responsibleParty,
        volumeLost,
        streamWatershed: otherStreamWatershed ? otherStreamWatershed : streamWatershed,
        enforcementAction,
        penaltyDate: penaltyDate,
        penaltyAmount,
        penaltyDueDate: penaltyDueDate,
        paymentReceived: paymentReceived,
        compliance,
        closed,
        updatedBy: email,
    }, {
        where: {
            uuid: req.params.uuid
        },
        returning: true,
    });
    const [affectedCount, affectedRows] = illicit;
    if (affectedCount === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to update illicit discharge by uuid ${req.params.uuid}`, 500));
    }
    const data = affectedRows[0];
    if (inspectorEmail && inspectorId && production) {
        await (0, emailInspector_1.emailInspector)(inspectorEmail.email, { uuid: data.uuid, illicitId: data.illicitId, details: data.details });
    }
    res.status(200).json({
        success: true,
        msg: "Violation Updated",
        data
    });
});
// @desc    Delete illicit discharge
// @route   DELETE /api/v1/stormwater/illicit-discharges/:uuid
// @access  Private
exports.deleteIllicitDischarge = (0, async_1.default)(async (req, res, next) => {
    const result = await stormwater_1.IllicitDischarge.destroy({
        where: {
            uuid: req.params.uuid
        }
    });
    if (result === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to delete illicit discharge by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        msg: "Violation Deleted"
    });
});
//# sourceMappingURL=illicitDischarges.js.map