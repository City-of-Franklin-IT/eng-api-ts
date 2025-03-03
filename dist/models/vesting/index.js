"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VestingStatus = exports.VestingPeriod = exports.VestingNotification = exports.VestingExtension = exports.Resolution = exports.Project = exports.MilestoneStatus = exports.MilestoneExtension = exports.Milestone = exports.Approval = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: 'config/config.env' });
// Types
const sequelize_1 = require("sequelize");
const Approval_1 = __importDefault(require("./Approval"));
const Milestone_1 = __importDefault(require("./Milestone"));
const MilestoneExtension_1 = __importDefault(require("./MilestoneExtension"));
const MilestoneStatus_1 = __importDefault(require("./MilestoneStatus"));
const Project_1 = __importDefault(require("./Project"));
const Resolution_1 = __importDefault(require("./Resolution"));
const VestingExtension_1 = __importDefault(require("./VestingExtension"));
const VestingNotification_1 = __importDefault(require("./VestingNotification"));
const VestingPeriod_1 = __importDefault(require("./VestingPeriod"));
const VestingStatus_1 = __importDefault(require("./VestingStatus"));
const env = process.env.NODE_ENV || 'development';
const config_1 = __importDefault(require("../../config/config"));
const cfg = config_1.default;
const db = {
    sequelize: {},
    Approval: {},
    Milestone: {},
    MilestoneExtension: {},
    MilestoneStatus: {},
    Project: {},
    Resolution: {},
    VestingExtension: {},
    VestingNotification: {},
    VestingPeriod: {},
    VestingStatus: {}
};
const dbPath = cfg[env].databases['vesting'];
db.sequelize = new sequelize_1.Sequelize(dbPath.database, dbPath.username, dbPath.password, dbPath);
db.Approval = (0, Approval_1.default)(db.sequelize, sequelize_1.DataTypes);
db.Milestone = (0, Milestone_1.default)(db.sequelize, sequelize_1.DataTypes);
db.MilestoneExtension = (0, MilestoneExtension_1.default)(db.sequelize, sequelize_1.DataTypes);
db.MilestoneStatus = (0, MilestoneStatus_1.default)(db.sequelize, sequelize_1.DataTypes);
db.Project = (0, Project_1.default)(db.sequelize, sequelize_1.DataTypes);
db.Resolution = (0, Resolution_1.default)(db.sequelize, sequelize_1.DataTypes);
db.VestingExtension = (0, VestingExtension_1.default)(db.sequelize, sequelize_1.DataTypes);
db.VestingNotification = (0, VestingNotification_1.default)(db.sequelize, sequelize_1.DataTypes);
db.VestingPeriod = (0, VestingPeriod_1.default)(db.sequelize, sequelize_1.DataTypes);
db.VestingStatus = (0, VestingStatus_1.default)(db.sequelize, sequelize_1.DataTypes);
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});
exports.Approval = db.Approval;
exports.Milestone = db.Milestone;
exports.MilestoneExtension = db.MilestoneExtension;
exports.MilestoneStatus = db.MilestoneStatus;
exports.Project = db.Project;
exports.Resolution = db.Resolution;
exports.VestingExtension = db.VestingExtension;
exports.VestingNotification = db.VestingNotification;
exports.VestingPeriod = db.VestingPeriod;
exports.VestingStatus = db.VestingStatus;
//# sourceMappingURL=index.js.map