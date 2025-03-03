"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRespondentsByADDRKEY = exports.downloadTemplate = exports.verifyRespondent = exports.getRespondents = exports.deleteRespondent = exports.updateRespondent = exports.createRespondents = void 0;
const fs_1 = __importDefault(require("fs"));
const sequelize_1 = require("sequelize");
const async_1 = __importDefault(require("@middleware/async"));
const errorResponse_1 = require("@utils/errorResponse");
const createShortId_1 = __importDefault(require("@utils/createShortId"));
const infor_1 = require("@models/infor");
const traffic_calming_1 = require("@models/traffic-calming");
//@desc    Create petition respondents
//@route   POST /api/v1/eng/traffic-calming/respondent
//@access  Private
exports.createRespondents = (0, async_1.default)(async (req, res, next) => {
    const newRespondents = req.body;
    const email = req.user?.email;
    Promise.all(newRespondents.map(async (respondent) => {
        const { name, address, ownerAddress, ownerCity, ownerState, ownerZIP, parentId } = respondent;
        const result = await traffic_calming_1.Respondent.create({
            name,
            address,
            ownerAddress,
            ownerCity,
            ownerState,
            ownerZIP,
            shortId: (0, createShortId_1.default)(),
            parentId,
            createdBy: email,
            updatedBy: email
        });
        if (!result) {
            return next(new errorResponse_1.ErrorResponse('Error creating petition respondent', 500));
        }
    }));
    res.status(201).json({
        success: true,
        msg: 'Petition Respondents Created'
    });
});
//@desc    Update petition respondent
//@route   PUT /api/v1/eng/traffic-calming/respondent/:uuid
//@access  Private
exports.updateRespondent = (0, async_1.default)(async (req, res, next) => {
    const { name, address, ownerAddress, ownerCity, ownerState, ownerZIP } = req.body;
    const email = req.user?.email;
    const respondent = await traffic_calming_1.Respondent.update({
        name,
        address,
        ownerAddress,
        ownerCity,
        ownerState,
        ownerZIP,
        updatedBy: email
    }, {
        where: {
            uuid: req.params.uuid
        }
    });
    const [affectedCount] = respondent;
    if (affectedCount === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to update petition respondent by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        msg: 'Petition Respondent Updated'
    });
});
//@desc    Delete petition respondent
//@route   DELETE /api/v1/eng/traffic-calming/respondent/:uuid
//@access  Private
exports.deleteRespondent = (0, async_1.default)(async (req, res, next) => {
    const result = await traffic_calming_1.Respondent.destroy({
        where: {
            uuid: req.params.uuid
        }
    });
    if (result === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to delete respondent by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        msg: 'Petition Respondent Deleted'
    });
});
//@desc    Get respondents by petition
//@route   GET /api/v1/eng/traffic-calming/respondent/petition/:uuid
//@access  Public
exports.getRespondents = (0, async_1.default)(async (req, res, next) => {
    const respondents = await traffic_calming_1.Respondent.findAll({
        where: {
            parentId: req.params.uuid
        },
        include: { model: traffic_calming_1.Response }
    });
    res.status(200).json({
        success: true,
        data: respondents
    });
});
//@desc    Verify respondent by shortId
//@route   GET /api/v1/eng/traffic-calming/respondent/id/:shortid
//@access  Public
exports.verifyRespondent = (0, async_1.default)(async (req, res, next) => {
    const result = await traffic_calming_1.Respondent.findOne({
        where: {
            shortId: req.params.shortid
        },
        include: [
            { model: traffic_calming_1.Petition,
                include: [
                    { model: traffic_calming_1.Attachment,
                        attributes: ['parentId', 'fileType', 'uuid']
                    }
                ] },
            { model: traffic_calming_1.Response }
        ]
    });
    if (!result) { // No match on shortId
        res.status(400).json({
            success: false,
            msg: `Unable to verify respondent id ${req.params.shortid}`
        });
    }
    if (result.Response) { // Match on shortId - has response
        const response = result.Response.response ? 'Yes' : 'No';
        const responseDate = new Date(result.Response.createdAt).toLocaleDateString();
        res.status(400).json({
            success: false,
            msg: `Received ${response} vote on ${responseDate}`
        });
    }
    res.status(200).json({
        success: true,
        data: result,
        msg: "Respondent Verified"
    });
});
//@desc    Download respondent template
//@route   POST /api/v1/eng/traffic-calming/respondent/template
//@access  Private
exports.downloadTemplate = (0, async_1.default)(async (req, res, next) => {
    const fileName = 'TrafficCalmingTemplate.csv';
    const filePath = `../eng-api-ts/public/files/${fileName}`;
    const fileExists = await fs_1.default.promises.access(filePath).then(() => true).catch(() => false);
    if (!fileExists) {
        return next(new errorResponse_1.ErrorResponse('Unable to download template', 500));
    }
    res.download(filePath); // File download
});
//@desc    Get respondents by ADDRKEY
//@route   POST /api/v1/eng/traffic-calming/respondent/search
//@access  Private
exports.getRespondentsByADDRKEY = (0, async_1.default)(async (req, res, next) => {
    try {
        const { addrkeys } = req.body;
        const results = await infor_1.InforAddress.findAll({
            where: {
                addrkey: {
                    [sequelize_1.Op.in]: addrkeys
                }
            }
        });
        res.status(200).json({
            success: true,
            data: results
        });
    }
    catch (err) {
        console.log(err);
    }
});
//# sourceMappingURL=respondent.js.map