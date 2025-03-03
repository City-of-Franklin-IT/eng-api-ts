"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUpdate = exports.updateUpdate = exports.createUpdate = void 0;
const async_1 = __importDefault(require("@middleware/async"));
const errorResponse_1 = require("@utils/errorResponse");
const cip_1 = require("@models/cip");
//@desc    Create project update
//@route   POST /api/v1/eng/cip/updates
//@access  Private
exports.createUpdate = (0, async_1.default)(async (req, res, next) => {
    const { projectUpdate, parentId } = req.body;
    const email = req.user?.email;
    const update = await cip_1.Update.create({
        projectUpdate,
        parentId,
        createdBy: email,
        updatedBy: email
    });
    if (!update) {
        return next(new errorResponse_1.ErrorResponse('Could not create project update', 500));
    }
    res.status(200).json({
        success: true,
        msg: "Project Update Created"
    });
});
//@desc    Update project update
//@route   PUT /api/v1/eng/cip/updates/:uuid
//@access  Private
exports.updateUpdate = (0, async_1.default)(async (req, res, next) => {
    const { projectUpdate } = req.body;
    const email = req.user?.email;
    const update = await cip_1.Update.update({
        projectUpdate,
        updatedBy: email
    }, {
        where: {
            uuid: req.params.uuid
        }
    });
    if (!update) {
        return next(new errorResponse_1.ErrorResponse(`Could not update project update by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        msg: "Project Update Updated"
    });
});
//@desc    Delete project update
//@route   DELETE /api/v1/eng/cip/updates/:uuid
//@access  Private
exports.deleteUpdate = (0, async_1.default)(async (req, res, next) => {
    await cip_1.Update.destroy({
        where: {
            uuid: req.params.uuid
        }
    });
    res.status(200).json({
        success: true,
        msg: "Project Update Deleted"
    });
});
//# sourceMappingURL=update.js.map