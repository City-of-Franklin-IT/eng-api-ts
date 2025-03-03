"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSiteContacts = exports.createSiteContact = void 0;
const async_1 = __importDefault(require("@middleware/async"));
const errorResponse_1 = require("@utils/errorResponse");
const stormwater_1 = require("@models/stormwater");
// @desc    Create site contact
// @route   POST /api/v1/stormwater/site-contacts
// @access  Private
exports.createSiteContact = (0, async_1.default)(async (req, res, next) => {
    const { siteId, contactId, isPrimary, isContractor, isInspector } = req.body;
    const email = req.user?.email;
    const siteContact = await stormwater_1.SiteContact.create({
        siteId,
        contactId,
        isPrimary,
        isContractor,
        isInspector,
        createdBy: email,
        updatedBy: email
    });
    if (!siteContact) {
        return next(new errorResponse_1.ErrorResponse("Unable to create site contact", 500));
    }
    res.status(201).json({
        success: true,
        msg: "Site Contact Created",
        data: siteContact
    });
});
// @desc    Delete all site contacts by siteId
// @route   DELETE /api/v1/eng/stormwater/site-contacts/site/:siteid
exports.deleteSiteContacts = (0, async_1.default)(async (req, res, next) => {
    await stormwater_1.SiteContact.destroy({
        where: {
            siteId: req.params.siteid
        }
    });
    res.status(200).json({
        success: true,
        msg: "Site Contacts Deleted"
    });
});
//# sourceMappingURL=siteContacts.js.map