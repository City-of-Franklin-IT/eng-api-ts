"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveSites = exports.deleteSite = exports.updateSite = exports.getSite = exports.getSites = exports.createSite = void 0;
const uuid_1 = require("uuid");
const sequelize_1 = require("sequelize");
const async_1 = __importDefault(require("@middleware/async"));
const errorResponse_1 = require("@utils/errorResponse");
const stormwater_1 = require("@models/stormwater");
const emailInspector_1 = require("@utils/automatedEmails/emailInspector");
// @desc    Create site
// @route   POST /api/v1/stormwater/sites
// @access  Private
exports.createSite = (0, async_1.default)(async (req, res, next) => {
    const { inspectorId, name, preconDate, location, xCoordinate, yCoordinate, permit, cof, tnq, greenInfrastructure } = req.body;
    const production = process.env.NODE_ENV === 'production';
    const email = req.user?.email;
    const site = await stormwater_1.Site.create({
        siteId: `site-${(0, uuid_1.v4)()}`,
        inspectorId,
        name,
        preconDate,
        location,
        xCoordinate,
        yCoordinate,
        permit,
        cof,
        tnq,
        greenInfrastructure,
        createdBy: email,
        updatedBy: email
    });
    if (!site) {
        return next(new errorResponse_1.ErrorResponse("Unable to create site", 500));
    }
    if (inspectorId && production) { // If inspector assigned and in production - email inspector
        const inspector = await stormwater_1.Inspector.findOne({
            where: {
                inspectorId
            },
            attributes: ['email']
        });
        if (inspector) {
            await (0, emailInspector_1.emailInspector)(inspector.email, { uuid: site.uuid, name: site.name });
        }
    }
    res.status(201).json({
        success: true,
        msg: "Site Created",
        data: site
    });
});
// @desc    Get sites
// @route   GET /api/v1/stormwater/sites
// @access  Private
exports.getSites = (0, async_1.default)(async (req, res, next) => {
    const results = await stormwater_1.Site.findAll({
        order: [
            ['name', 'asc'],
            [stormwater_1.Log, 'inspectionDate', 'desc'],
            [stormwater_1.ConstructionViolation, 'date', 'desc'],
            [stormwater_1.ConstructionViolation, stormwater_1.FollowUpDate, 'followUpDate', 'desc'],
            [stormwater_1.Complaint, 'date', 'desc'],
            [stormwater_1.Complaint, stormwater_1.FollowUpDate, 'followUpDate', 'desc'],
            [stormwater_1.IllicitDischarge, 'date', 'desc'],
            [stormwater_1.IllicitDischarge, stormwater_1.FollowUpDate, 'followUpDate', 'desc']
        ],
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
    res.status(200).json({
        success: true,
        data: sites
    });
});
// @desc    Get site
// @route   GET /api/v1/stormwater/sites/:uuid
// @access  Private
exports.getSite = (0, async_1.default)(async (req, res, next) => {
    const site = await stormwater_1.Site.findOne({
        where: {
            uuid: req.params.uuid
        },
        order: [
            ['name', 'asc'],
            [stormwater_1.Log, 'inspectionDate', 'desc'],
            [stormwater_1.ConstructionViolation, 'date', 'desc'],
            [stormwater_1.ConstructionViolation, stormwater_1.FollowUpDate, 'followUpDate', 'desc'],
            [stormwater_1.Complaint, 'date', 'desc'],
            [stormwater_1.Complaint, stormwater_1.FollowUpDate, 'followUpDate', 'desc'],
            [stormwater_1.IllicitDischarge, 'date', 'desc'],
            [stormwater_1.IllicitDischarge, stormwater_1.FollowUpDate, 'followUpDate', 'desc']
        ],
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
    if (!site) {
        return next(new errorResponse_1.ErrorResponse(`Unable to return site by uuid ${req.params.uuid}`, 500));
    }
    site.hasOpenViolation = !!site.ConstructionViolations?.some(violation => !violation.closed);
    site.hasOpenComplaint = !!site.Complaints?.some(complaint => !complaint.closed);
    site.hasOpenIllicitDischarge = !!site.IllicitDischarges?.some(discharge => !discharge.closed);
    res.status(200).json({
        success: true,
        data: site
    });
});
// @desc    Update site
// @route   PUT /api/v1/stormwater/sites/:uuid
// @access  Private
exports.updateSite = (0, async_1.default)(async (req, res, next) => {
    const { inspectorId, name, location, preconDate, xCoordinate, yCoordinate, permit, cof, tnq, greenInfrastructure, inactive } = req.body;
    const production = process.env.NODE_ENV === 'production';
    const email = req.user?.email;
    const inspector = await (0, emailInspector_1.inspectorLookup)(req.params.uuid, stormwater_1.Site, inspectorId);
    const site = await stormwater_1.Site.update({
        inspectorId,
        name,
        location,
        preconDate,
        xCoordinate,
        yCoordinate,
        permit,
        cof,
        tnq,
        greenInfrastructure,
        inactive,
        updatedBy: email,
    }, {
        where: {
            uuid: req.params.uuid
        },
        returning: true
    });
    const [affectedRows, updatedRecords] = site;
    if (affectedRows === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to update site by uuid ${req.params.uuid}`, 500));
    }
    const data = updatedRecords[0];
    if (inspector && inspectorId && production) { // If inspector assigned and in production - email inspector
        await (0, emailInspector_1.emailInspector)(inspector.email, { uuid: data.uuid, name: data.name });
    }
    res.status(200).json({
        success: true,
        msg: "Site Updated",
        data
    });
});
// @desc    Delete site
// @route   DELETE /api/v1/stormwater/sites/:uuid
// @access  Private
exports.deleteSite = (0, async_1.default)(async (req, res, next) => {
    const result = await stormwater_1.Site.destroy({
        where: {
            uuid: req.params.uuid
        }
    });
    if (result === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to delete site by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        msg: "Site Deleted"
    });
});
//@desc    Get active sites
//@route   GET /api/v1/stormwater/sites/active
//@access  Private
exports.getActiveSites = (0, async_1.default)(async (req, res, next) => {
    const sites = await stormwater_1.Site.findAll({
        where: {
            inactive: {
                [sequelize_1.Op.ne]: true
            }
        },
        order: [['name', 'asc']],
        attributes: ['name', 'siteId', 'xCoordinate', 'yCoordinate', 'inspectorId', 'uuid']
    });
    res.status(200).json({
        success: true,
        data: sites
    });
});
//# sourceMappingURL=sites.js.map