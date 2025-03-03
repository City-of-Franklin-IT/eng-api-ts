"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteContact = exports.updateContact = exports.getContact = exports.getContacts = exports.createContact = void 0;
const uuid_1 = require("uuid");
const async_1 = __importDefault(require("@middleware/async"));
const errorResponse_1 = require("@utils/errorResponse");
const stormwater_1 = require("@models/stormwater");
// @desc    Create contact
// @route   POST /api/v1/stormwater/contacts
// @access  Private
exports.createContact = (0, async_1.default)(async (req, res, next) => {
    const { name, phone, company, email } = req.body;
    const userEmail = req.user?.email;
    const contact = await stormwater_1.Contact.create({
        contactId: `contact-${(0, uuid_1.v4)()}`,
        name,
        phone,
        company,
        email,
        createdBy: userEmail,
        updatedBy: userEmail,
    });
    if (!contact) {
        return next(new errorResponse_1.ErrorResponse("Unable to create contact", 500));
    }
    res.status(201).json({
        success: true,
        msg: "Contact Created",
        data: contact
    });
});
// @desc    Get contacts
// @route   GET /api/v1/stormwater/contacts
// @access  Private
exports.getContacts = (0, async_1.default)(async (req, res, next) => {
    const contacts = await stormwater_1.Contact.findAll({
        order: [['name', 'asc']],
        include: [
            { model: stormwater_1.SiteContact,
                include: [{ model: stormwater_1.Site }] }
        ]
    });
    res.status(200).json({
        success: true,
        data: contacts
    });
});
// @desc    Get contact
// @route   GET /api/v1/stormwater/contacts/:uuid
// @access  Private
exports.getContact = (0, async_1.default)(async (req, res, next) => {
    const contact = await stormwater_1.Contact.findOne({
        where: {
            uuid: req.params.uuid
        },
        include: [{
                model: stormwater_1.SiteContact,
                include: [{ model: stormwater_1.Site }]
            }]
    });
    if (!contact) {
        return next(new errorResponse_1.ErrorResponse(`Unable to return contact by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        data: contact
    });
});
// @desc    Update contact
// @route   PUT /api/v1/stormwater/contacts/:uuid
// @access  Private
exports.updateContact = (0, async_1.default)(async (req, res, next) => {
    const { name, phone, company, email, inactive } = req.body;
    const userEmail = req.user?.email;
    const contact = await stormwater_1.Contact.update({
        name,
        phone,
        company,
        email,
        inactive,
        updatedBy: userEmail,
    }, {
        where: {
            uuid: req.params.uuid
        },
        returning: true,
    });
    const [affectedCount, affectedRows] = contact;
    if (affectedCount === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to update contact by uuid ${req.params.uuid}`, 500));
    }
    const data = affectedRows[0];
    res.status(200).json({
        success: true,
        msg: "Contact Updated",
        data
    });
});
// @desc    Delete contact
// @route   DELETE /api/v1/stormwater/contacts/:uuid
// @access  Private
exports.deleteContact = (0, async_1.default)(async (req, res, next) => {
    const result = await stormwater_1.Contact.destroy({
        where: {
            uuid: req.params.uuid
        }
    });
    if (result === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to delete contact by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        msg: "Contact Deleted"
    });
});
//# sourceMappingURL=contacts.js.map