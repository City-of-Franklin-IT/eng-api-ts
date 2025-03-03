"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteContact = exports.Site = exports.Log = exports.Inspector = exports.IllicitDischarge = exports.GreenInfrastructure = exports.FollowUpDate = exports.Contact = exports.ConstructionViolation = exports.Complaint = exports.Attachment = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: 'config/config.env' });
// Types
const sequelize_1 = require("sequelize");
const Attachment_1 = __importDefault(require("./Attachment"));
const Complaint_1 = __importDefault(require("./Complaint"));
const ConstructionViolation_1 = __importDefault(require("./ConstructionViolation"));
const Contact_1 = __importDefault(require("./Contact"));
const FollowUpDate_1 = __importDefault(require("./FollowUpDate"));
const GreenInfrastructure_1 = __importDefault(require("./GreenInfrastructure"));
const IllicitDischarge_1 = __importDefault(require("./IllicitDischarge"));
const Inspector_1 = __importDefault(require("./Inspector"));
const Log_1 = __importDefault(require("./Log"));
const Site_1 = __importDefault(require("./Site"));
const SiteContact_1 = __importDefault(require("./SiteContact"));
const env = process.env.NODE_ENV || 'development';
const config_1 = __importDefault(require("../../config/config"));
const cfg = config_1.default;
const db = {
    sequelize: {},
    Attachment: {},
    Complaint: {},
    ConstructionViolation: {},
    Contact: {},
    FollowUpDate: {},
    GreenInfrastructure: {},
    IllicitDischarge: {},
    Inspector: {},
    Log: {},
    Site: {},
    SiteContact: {}
};
const dbPath = cfg[env].databases['stormwater'];
db.sequelize = new sequelize_1.Sequelize(dbPath.database, dbPath.username, dbPath.password, dbPath);
db.Attachment = (0, Attachment_1.default)(db.sequelize, sequelize_1.DataTypes);
db.Complaint = (0, Complaint_1.default)(db.sequelize, sequelize_1.DataTypes);
db.ConstructionViolation = (0, ConstructionViolation_1.default)(db.sequelize, sequelize_1.DataTypes);
db.Contact = (0, Contact_1.default)(db.sequelize, sequelize_1.DataTypes);
db.FollowUpDate = (0, FollowUpDate_1.default)(db.sequelize, sequelize_1.DataTypes);
db.GreenInfrastructure = (0, GreenInfrastructure_1.default)(db.sequelize, sequelize_1.DataTypes);
db.IllicitDischarge = (0, IllicitDischarge_1.default)(db.sequelize, sequelize_1.DataTypes);
db.Inspector = (0, Inspector_1.default)(db.sequelize, sequelize_1.DataTypes);
db.Log = (0, Log_1.default)(db.sequelize, sequelize_1.DataTypes);
db.Site = (0, Site_1.default)(db.sequelize, sequelize_1.DataTypes);
db.SiteContact = (0, SiteContact_1.default)(db.sequelize, sequelize_1.DataTypes);
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});
exports.Attachment = db.Attachment;
exports.Complaint = db.Complaint;
exports.ConstructionViolation = db.ConstructionViolation;
exports.Contact = db.Contact;
exports.FollowUpDate = db.FollowUpDate;
exports.GreenInfrastructure = db.GreenInfrastructure;
exports.IllicitDischarge = db.IllicitDischarge;
exports.Inspector = db.Inspector;
exports.Log = db.Log;
exports.Site = db.Site;
exports.SiteContact = db.SiteContact;
//# sourceMappingURL=index.js.map