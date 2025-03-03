"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Update = exports.Spending = exports.Phase = exports.Milestone = exports.Project = void 0;
const moment_1 = __importDefault(require("moment"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: 'config/config.env' });
const sequelize_1 = require("sequelize");
// Types
const sequelize_2 = require("sequelize");
const Project_1 = __importDefault(require("./Project"));
const Milestone_1 = __importDefault(require("./Milestone"));
const Phase_1 = __importDefault(require("./Phase"));
const Spending_1 = __importDefault(require("./Spending"));
const Update_1 = __importDefault(require("./Update"));
const env = process.env.NODE_ENV || 'development';
const config_1 = __importDefault(require("../../config/config"));
const cfg = config_1.default;
const db = {
    sequelize: {},
    Project: {},
    Milestone: {},
    Phase: {},
    Spending: {},
    Update: {}
};
const dbPath = cfg[env].databases['cip'];
db.sequelize = new sequelize_1.Sequelize(dbPath.database, dbPath.username, dbPath.password, dbPath);
sequelize_2.DataTypes.DATE.prototype._stringify = function _stringify(date) {
    if (!date)
        return date;
    const momentDate = moment_1.default.isMoment(date) ? date : (0, moment_1.default)(date);
    return momentDate.format('YYYY-MM-DD HH:mm:ss.SSS');
};
db.Project = (0, Project_1.default)(db.sequelize, sequelize_2.DataTypes);
db.Milestone = (0, Milestone_1.default)(db.sequelize, sequelize_2.DataTypes);
db.Phase = (0, Phase_1.default)(db.sequelize, sequelize_2.DataTypes);
db.Spending = (0, Spending_1.default)(db.sequelize, sequelize_2.DataTypes);
db.Update = (0, Update_1.default)(db.sequelize, sequelize_2.DataTypes);
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});
exports.Project = db.Project;
exports.Milestone = db.Milestone;
exports.Phase = db.Phase;
exports.Spending = db.Spending;
exports.Update = db.Update;
//# sourceMappingURL=index.js.map