"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComplaint = exports.updateComplaint = exports.getComplaint = exports.getComplaints = exports.createComplaint = void 0;
const uuid_1 = require("uuid");
const async_1 = __importDefault(require("@middleware/async"));
const errorResponse_1 = require("@utils/errorResponse");
const stormwater_1 = require("@models/stormwater");
const emailInspector_1 = require("@utils/automatedEmails/emailInspector");
// @desc    Create complaint
// @route   POST /api/v1/stormwater/complaints
// @access  Private
exports.createComplaint = (0, async_1.default)(async (req, res, next) => {
    const { date, siteId, inspectorId, name, address, phone, email, xCoordinate, yCoordinate, locationDescription, concern, otherConcern, details, responsibleParty, comments } = req.body;
    const production = process.env.NODE_ENV === 'production';
    const userEmail = req.user?.email;
    const complaint = await stormwater_1.Complaint.create({
        complaintId: `complaint-${(0, uuid_1.v4)()}`,
        date,
        siteId,
        inspectorId,
        name,
        address,
        phone,
        email,
        xCoordinate,
        yCoordinate,
        locationDescription,
        concern,
        otherConcern,
        details,
        responsibleParty,
        comments,
        createdBy: userEmail,
        updatedBy: userEmail,
    });
    if (!complaint) {
        return next(new errorResponse_1.ErrorResponse("Unable to create complaint", 500));
    }
    if (inspectorId && production) { // If inspector assigned - email inspector
        const inspector = await stormwater_1.Inspector.findOne({
            where: {
                inspectorId
            }
        });
        const data = { complaintId: complaint.complaintId, details: complaint.details, uuid: complaint.uuid };
        await (0, emailInspector_1.emailInspector)(inspector.email, data);
    }
    res.status(201).json({
        success: true,
        msg: "Complaint Created",
        data: complaint
    });
});
// @desc    Get complaints - no associated site
// @route   GET /api/v1/stormwater/complaints
// @access  Private
exports.getComplaints = (0, async_1.default)(async (req, res, next) => {
    const complaints = await stormwater_1.Complaint.findAll({
        where: {
            siteId: null
        },
        order: [['date', 'desc'], [stormwater_1.FollowUpDate, 'followUpDate', 'desc']],
        include: [{ model: stormwater_1.FollowUpDate }]
    });
    res.status(200).json({
        success: true,
        data: complaints
    });
});
// @desc    Get complaint
// @route   GET /api/v1/stormwater/complaints/:uuid
// @access  Private
exports.getComplaint = (0, async_1.default)(async (req, res, next) => {
    const complaint = await stormwater_1.Complaint.findOne({
        where: {
            uuid: req.params.uuid
        },
        order: [[stormwater_1.FollowUpDate, 'followUpDate', 'desc']],
        include: [
            { model: stormwater_1.Site },
            { model: stormwater_1.FollowUpDate }
        ]
    });
    if (!complaint) {
        return next(new errorResponse_1.ErrorResponse(`Unable to return complaint by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        data: complaint
    });
});
// @desc    Update complaint
// @route   PUT /api/v1/stormwater/complaints/:uuid
// @access  Private
exports.updateComplaint = (0, async_1.default)(async (req, res, next) => {
    const { date, siteId, inspectorId, name, address, phone, email, xCoordinate, yCoordinate, locationDescription, concern, otherConcern, details, responsibleParty, comments, compliance, closed } = req.body;
    const production = process.env.NODE_ENV === 'production';
    const userEmail = req.user?.email;
    const inspectorEmail = await (0, emailInspector_1.inspectorLookup)(req.params.uuid, stormwater_1.Complaint, inspectorId);
    const complaint = await stormwater_1.Complaint.update({
        date,
        siteId,
        inspectorId,
        name,
        address,
        phone,
        email,
        xCoordinate,
        yCoordinate,
        locationDescription,
        concern,
        otherConcern,
        details,
        responsibleParty,
        comments,
        compliance,
        closed,
        updatedBy: userEmail,
    }, {
        where: {
            uuid: req.params.uuid
        },
        returning: true
    });
    const [affectedCount, affectedRows] = complaint;
    if (affectedCount === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to update complaint by uuid ${req.params.uuid}`, 500));
    }
    const data = affectedRows[0];
    if (inspectorEmail && inspectorId && production) { // If inspector assigned - email inspector
        const obj = { siteId: data.siteId, complaintId: data.complaintId, details: data.details, uuid: data.uuid };
        await (0, emailInspector_1.emailInspector)(inspectorEmail.email, obj);
    }
    res.status(200).json({
        success: true,
        msg: "Complaint Updated",
        data
    });
});
// @desc    Delete complaint
// @route   DELETE /api/v1/stormwater/complaints/:uuid
// @access  Private
exports.deleteComplaint = (0, async_1.default)(async (req, res, next) => {
    const result = await stormwater_1.Complaint.destroy({
        where: {
            uuid: req.params.uuid
        }
    });
    if (result === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to delete complaint by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        msg: "Complaint Deleted"
    });
});
//# sourceMappingURL=complaints.js.map