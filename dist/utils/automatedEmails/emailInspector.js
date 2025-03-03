"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inspectorLookup = exports.emailInspector = void 0;
const stormwater_1 = require("@models/stormwater");
const sendEmail_1 = __importDefault(require("./sendEmail"));
const emailInspector = async (email, data) => {
    const obj = setMsg(data);
    if (obj) {
        await (0, sendEmail_1.default)({
            email,
            subject: obj.subject,
            msg: obj.msg
        });
    }
};
exports.emailInspector = emailInspector;
const inspectorLookup = async (uuid, model, inspectorId) => {
    if (inspectorId) {
        const result = await model.findOne({
            where: {
                uuid
            },
            attributes: ['inspectorId']
        });
        if (!result.inspectorId) { // New inspector assignment
            const inspector = await stormwater_1.Inspector.findOne({
                where: {
                    inspectorId
                },
                attributes: ['email']
            });
            return inspector;
        }
        else
            return null; // Inspector already assigned
    }
    return null;
};
exports.inspectorLookup = inspectorLookup;
const setMsg = (data) => {
    if (data.siteId) { // Site
        return {
            subject: "A site has been assigned to you",
            msg: `Site "${data.name}" has been assigned to you.\n\nPlease visit https://dev.franklintn.gov/stormwater/sites/${data.uuid} to view.`
        };
    }
    if (data.complaintId) { // Complaint
        return {
            subject: "A complaint has been assigned to you",
            msg: `A complaint has been assigned to you:\n\n"${data.details}"\n\nPlease visit https://dev.franklintn.gov/stormwater to view.`
        };
    }
    if (data.greenId) { // Green infrastructure violation
        return {
            subject: "A green infrastructure violation has been assigned to you",
            msg: `A green infrastructure violation has been assigned to you:\n\n"${data.details}"\n\nPlease visit https://dev.franklintn.gov/storwmater to view.`
        };
    }
    if (data.illicitId) { // Illicit discharge violation
        return {
            subject: "An illicit discharge violation has been assigned to you",
            msg: `An illicit discharge violation has been assigned to you:\n\n"${data.details}"\n\nPlease visit https://dev.franklintn.gov/stormwater to view.`
        };
    }
    return null;
};
//# sourceMappingURL=emailInspector.js.map