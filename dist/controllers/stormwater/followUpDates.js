"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFollowUpDate = exports.updateFollowUpDate = exports.createFollowUpDate = void 0;
const uuid_1 = require("uuid");
const async_1 = __importDefault(require("@middleware/async"));
const errorResponse_1 = require("@utils/errorResponse");
const stormwater_1 = require("@models/stormwater");
// @desc    Create follow up date
// @route   POST /api/v1/stormwater/followup
// @access  Private
exports.createFollowUpDate = (0, async_1.default)(async (req, res, next) => {
    const { parentId, followUpDate } = req.body;
    const email = req.user?.email;
    const type = parentId.split('-')[0];
    const date = await stormwater_1.FollowUpDate.create({
        followUpId: `follow-${(0, uuid_1.v4)()}`,
        violationId: type === 'violation' ? parentId : null,
        complaintId: type === 'complaint' ? parentId : null,
        illicitId: type === 'illicit' ? parentId : null,
        greenId: type === 'green' ? parentId : null,
        followUpDate,
        createdBy: email,
        updatedBy: email,
    });
    if (!date) {
        return next(new errorResponse_1.ErrorResponse("Unable to create follow up date", 500));
    }
    res.status(201).json({
        success: true,
        msg: "Follow Up Created",
        data: date
    });
});
// @desc    Update follow up date
// @route   PUT /api/v1/stormwater/followup/:uuid
// @access  Private
exports.updateFollowUpDate = (0, async_1.default)(async (req, res, next) => {
    const { followUpDate } = req.body;
    const email = req.user?.email;
    const date = await stormwater_1.FollowUpDate.update({
        followUpDate,
        updatedBy: email
    }, {
        where: {
            uuid: req.params.uuid
        },
        returning: true
    });
    const [affectedCount, affectedRows] = date;
    if (affectedCount === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to update follow up date by uuid ${req.params.uuid}`, 500));
    }
    const data = affectedRows[0];
    res.status(200).json({
        success: true,
        msg: "Followup Updated",
        data
    });
});
// @desc    Delete follow up date
// @route   DELETE /api/v1/stormwater/followup/:uuid
// @access  Private
exports.deleteFollowUpDate = (0, async_1.default)(async (req, res, next) => {
    const result = await stormwater_1.FollowUpDate.destroy({
        where: {
            uuid: req.params.uuid
        }
    });
    if (result === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to delete follow up date by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        msg: "Follow Up Deleted"
    });
});
//# sourceMappingURL=followUpDates.js.map