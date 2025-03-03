"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Response = exports.Respondent = exports.Petition = exports.Attachment = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: 'config/config.env' });
// Types
const sequelize_1 = require("sequelize");
const Attachment_1 = __importDefault(require("./Attachment"));
const Petition_1 = __importDefault(require("./Petition"));
const Respondent_1 = __importDefault(require("./Respondent"));
const Response_1 = __importDefault(require("./Response"));
const env = process.env.NODE_ENV || 'development';
const config_1 = __importDefault(require("../../config/config"));
const cfg = config_1.default;
const db = {
    sequelize: {},
    Attachment: {},
    Petition: {},
    Respondent: {},
    Response: {}
};
const dbPath = cfg[env].databases['traffic-calming'];
db.sequelize = new sequelize_1.Sequelize(dbPath.database, dbPath.username, dbPath.password, dbPath);
db.Attachment = (0, Attachment_1.default)(db.sequelize, sequelize_1.DataTypes);
db.Petition = (0, Petition_1.default)(db.sequelize, sequelize_1.DataTypes);
db.Respondent = (0, Respondent_1.default)(db.sequelize, sequelize_1.DataTypes);
db.Response = (0, Response_1.default)(db.sequelize, sequelize_1.DataTypes);
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});
exports.Attachment = db.Attachment;
exports.Petition = db.Petition;
exports.Respondent = db.Respondent;
exports.Response = db.Response;
//# sourceMappingURL=index.js.map