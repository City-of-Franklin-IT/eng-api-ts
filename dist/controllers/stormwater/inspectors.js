"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteInspector = exports.updateInspector = exports.getInspector = exports.getInspectors = exports.createInspector = void 0;
const uuid_1 = require("uuid");
const async_1 = __importDefault(require("@middleware/async"));
const errorResponse_1 = require("@utils/errorResponse");
const stormwater_1 = require("@models/stormwater");
// @desc    Create inspector
// @route   POST /api/v1/stormwater/inspectors
// @access  Private
exports.createInspector = (0, async_1.default)(async (req, res, next) => {
    const { name, email } = req.body;
    const userEmail = req.user?.email;
    const inspector = await stormwater_1.Inspector.create({
        inspectorId: `inspector-${(0, uuid_1.v4)()}`,
        name,
        email,
        slug: name.split(' ')[0].toLowerCase() + '-' + name.split(' ')[1].toLowerCase(),
        createdBy: userEmail,
        updatedBy: userEmail,
    });
    if (!inspector) {
        return next(new errorResponse_1.ErrorResponse("Unable to create inspector", 500));
    }
    res.status(201).json({
        success: true,
        msg: "Inspector Created",
        data: inspector
    });
});
// @desc    Get inspectors
// @route   GET /api/v1/stormwater/inspectors
// @access  Private
exports.getInspectors = (0, async_1.default)(async (req, res, next) => {
    const inspectors = await stormwater_1.Inspector.findAll({
        order: [['name', 'asc'], [stormwater_1.Site, 'name', 'asc'], [stormwater_1.Complaint, 'date', 'desc']],
        include: [
            { model: stormwater_1.Site },
            { model: stormwater_1.Complaint }
        ]
    });
    res.status(200).json({
        success: true,
        data: inspectors
    });
});
// @desc    Get inspector sites
// @route   GET /api/v1/stormwater/inspectors/:inspectorid
// @access  Private
exports.getInspector = (0, async_1.default)(async (req, res, next) => {
    const results = await stormwater_1.Site.findAll({
        where: {
            inspectorId: req.params.inspectorid
        },
        order: [['name', 'asc']],
        include: [
            { model: stormwater_1.Inspector },
            { model: stormwater_1.SiteContact,
                include: [{ model: stormwater_1.Contact }]
            },
            { model: stormwater_1.Log },
            { model: stormwater_1.ConstructionViolation,
                include: [{ model: stormwater_1.FollowUpDate }]
            },
            { model: stormwater_1.Complaint,
                include: [{ model: stormwater_1.FollowUpDate }]
            }, {
                model: stormwater_1.IllicitDischarge,
                include: [{ model: stormwater_1.FollowUpDate }]
            }
        ]
    });
    const sites = results.map(result => {
        const site = result.toJSON();
        const openViolations = !!site.ConstructionViolations?.some(violation => !violation.closed);
        const openComplaints = !!site.Complaints?.some(complaint => !complaint.closed);
        const openIllicitDischarges = !!site.IllicitDischarges?.some(discharge => !discharge.closed);
        return {
            ...site,
            hasOpenViolation: openViolations,
            hasOpenComplaint: openComplaints,
            hasOpenIllicitDischarge: openIllicitDischarges
        };
    });
    const inspector = await stormwater_1.Inspector.findOne({
        where: {
            inspectorId: req.params.inspectorid
        }
    });
    res.status(200).json({
        success: true,
        data: { sites, inspector }
    });
});
// @desc    Update inspector
// @route   PUT /api/v1/stormwater/inspectors/:inspectorid
// @access  Private
exports.updateInspector = (0, async_1.default)(async (req, res, next) => {
    const { name, email, inactive } = req.body;
    const userEmail = req.user?.email;
    const inspector = await stormwater_1.Inspector.update({
        name,
        email,
        inactive,
        updatedBy: userEmail
    }, {
        where: {
            inspectorId: req.params.inspectorid
        },
        returning: true
    });
    const [affectedCount, affectedRows] = inspector;
    if (affectedCount === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to update inspector by inspectorId ${req.params.inspectorid}`, 500));
    }
    const data = affectedRows[0];
    res.status(200).json({
        success: true,
        msg: "Inspector Updated",
        data
    });
});
// @desc    Delete inspector
// @route   DELETE /api/v1/stormwater/inspectors/:inspectorid
// @access  Private
exports.deleteInspector = (0, async_1.default)(async (req, res, next) => {
    const result = await stormwater_1.Inspector.destroy({
        where: {
            inspectorId: req.params.inspectorid
        }
    });
    if (result === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to delete inspector by inspectorId ${req.params.inspectorid}`, 500));
    }
    res.status(200).json({
        success: true,
        msg: "Inspector Deleted"
    });
});
//# sourceMappingURL=inspectors.js.map