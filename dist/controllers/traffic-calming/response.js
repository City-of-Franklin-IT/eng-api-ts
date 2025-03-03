"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResponse = void 0;
const async_1 = __importDefault(require("@middleware/async"));
const errorResponse_1 = require("@utils/errorResponse");
const traffic_calming_1 = require("@models/traffic-calming");
//@desc    Create response
//@route   POST /api/v1/eng/traffic-calming/response
//@access  Public
exports.createResponse = (0, async_1.default)(async (req, res, next) => {
    const { response, parentId, shortId } = req.body;
    const validate = async () => {
        const respondent = await traffic_calming_1.Respondent.count({
            where: {
                shortId
            }
        });
        if (respondent === 0) { // Respondent not found in database
            return false;
        }
        return true;
    };
    const isValid = await validate();
    if (!isValid) { // If respondent is not valid - return error
        return next(new errorResponse_1.ErrorResponse(`Unable to verify respondent id ${shortId}`, 500));
    }
    const result = await traffic_calming_1.Response.create({
        response,
        parentId
    });
    if (!result) {
        return next(new errorResponse_1.ErrorResponse("Unable to create petition response", 500));
    }
    res.status(201).json({
        success: true,
        msg: 'Petition Response Saved',
        data: result
    });
});
//# sourceMappingURL=response.js.map