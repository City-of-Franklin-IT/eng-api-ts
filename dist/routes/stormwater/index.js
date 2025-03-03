"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const attachments_1 = __importDefault(require("./attachments"));
const complaints_1 = __importDefault(require("./complaints"));
const contacts_1 = __importDefault(require("./contacts"));
const followup_1 = __importDefault(require("./followup"));
const greenInfrastructure_1 = __importDefault(require("./greenInfrastructure"));
const illicitDischarges_1 = __importDefault(require("./illicitDischarges"));
const inspectors_1 = __importDefault(require("./inspectors"));
const logs_1 = __importDefault(require("./logs"));
const siteContacts_1 = __importDefault(require("./siteContacts"));
const sites_1 = __importDefault(require("./sites"));
const violations_1 = __importDefault(require("./violations"));
exports.default = (app) => {
    const baseURL = `${process.env.BASE_URL}/${path_1.default.basename(__dirname)}`;
    const setURL = (path, router) => {
        return app.use(`${baseURL}${path}`, router);
    };
    setURL('/attachments', attachments_1.default);
    setURL('/complaints', complaints_1.default);
    setURL('/contacts', contacts_1.default);
    setURL('/followup', followup_1.default);
    setURL('/greeninfrastructure', greenInfrastructure_1.default);
    setURL('/illicitdischarges', illicitDischarges_1.default);
    setURL('/inspectors', inspectors_1.default);
    setURL('/logs', logs_1.default);
    setURL('/sitecontacts', siteContacts_1.default);
    setURL('/sites', sites_1.default);
    setURL('/violations', violations_1.default);
};
//# sourceMappingURL=index.js.map