"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePhase = exports.createPhase = void 0;
const async_1 = __importDefault(require("@middleware/async"));
const errorResponse_1 = require("@utils/errorResponse");
const cip_1 = require("@models/cip");
//@desc    Create project phase
//@route   POST /api/v1/eng/cip/phases
//@access  Private
exports.createPhase = (0, async_1.default)(async (req, res, next) => {
    const { phase, parentId } = req.body;
    const email = req.user?.email;
    const result = await cip_1.Phase.create({
        phase,
        parentId,
        createdBy: email,
        updatedBy: email
    });
    if (!result) {
        return next(new errorResponse_1.ErrorResponse('Could not create new project phase', 500));
    }
    res.status(201).json({
        success: true,
        msg: "Project Phase Created"
    });
});
//@desc    Delete project phase
//@route   DELETE /api/v1/eng/cip/phases/:uuid
//@access  Private
exports.deletePhase = (0, async_1.default)(async (req, res, next) => {
    await cip_1.Phase.destroy({
        where: {
            uuid: req.params.uuid
        }
    });
    res.status(200).json({
        success: true,
        msg: "Proect Phase Deleted"
    });
});
//# sourceMappingURL=phase.js.map