"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePetition = exports.updatePetition = exports.createPetition = exports.getPetition = exports.getPetitions = void 0;
const async_1 = __importDefault(require("@middleware/async"));
const errorResponse_1 = require("@utils/errorResponse");
const traffic_calming_1 = require("@models/traffic-calming");
const createPetitionId_1 = __importDefault(require("@utils/createPetitionId"));
//@desc    Get petitions
//@route   GET /api/v1/eng/traffic-calming/petition
//@access  Public
exports.getPetitions = (0, async_1.default)(async (req, res, next) => {
    const petitions = await traffic_calming_1.Petition.findAll({
        order: [['startDate', 'asc']],
        include: [
            { model: traffic_calming_1.Respondent,
                include: [{ model: traffic_calming_1.Response }] },
            { model: traffic_calming_1.Attachment,
                attributes: ['parentId', 'fileType', 'uuid'] }
        ]
    });
    res.status(200).json({
        success: true,
        data: petitions
    });
});
//@desc    Get petition
//@route   GET /api/v1/eng/traffic-calming/petition/:uuid
//@access  Public
exports.getPetition = (0, async_1.default)(async (req, res, next) => {
    const petition = await traffic_calming_1.Petition.findOne({
        where: {
            uuid: req.params.uuid
        },
        include: [
            { model: traffic_calming_1.Respondent,
                include: [{ model: traffic_calming_1.Response }] },
            { model: traffic_calming_1.Attachment,
                attributes: ['parentId', 'fileType', 'uuid'] }
        ]
    });
    if (!petition) {
        return next(new errorResponse_1.ErrorResponse(`Unable to return petition by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        data: petition
    });
});
//@desc    Create petition
//@route   POST /api/v1/eng/traffic-calming/petition
//@access  Private
exports.createPetition = (0, async_1.default)(async (req, res, next) => {
    const { description, startDate, endDate } = req.body;
    const email = req.user?.email;
    const petition = await traffic_calming_1.Petition.create({
        petitionId: await (0, createPetitionId_1.default)(),
        description,
        startDate,
        endDate,
        createdBy: email,
        updatedBy: email
    });
    if (!petition) {
        return next(new errorResponse_1.ErrorResponse("Unable to create new petition", 500));
    }
    res.status(201).json({
        success: true,
        msg: 'Petition Created',
        data: petition
    });
});
//@desc    Update petition
//@route   PUT /api/v1/eng/traffic-calming/petition/:uuid
//@access  Private
exports.updatePetition = (0, async_1.default)(async (req, res, next) => {
    const { description, startDate, endDate } = req.body;
    const email = req.user?.email;
    const petition = await traffic_calming_1.Petition.update({
        description,
        startDate,
        endDate,
        updatedBy: email
    }, {
        where: {
            uuid: req.params.uuid
        },
    });
    const [affectedCount] = petition;
    if (affectedCount === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to update petition by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        msg: 'Petition Updated'
    });
});
//@desc    Delete petition
//@route   DELETE /api/v1/eng/traffic-calming/petition/:uuid
//@access  Private
exports.deletePetition = (0, async_1.default)(async (req, res, next) => {
    const result = await traffic_calming_1.Petition.destroy({
        where: {
            uuid: req.params.uuid
        }
    });
    if (result === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to delete petition by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        msg: 'Petition Deleted'
    });
});
//# sourceMappingURL=petition.js.map