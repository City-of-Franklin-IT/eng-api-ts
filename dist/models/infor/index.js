"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InforAddress = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: 'config/config.env' });
const sequelize_1 = require("sequelize");
const InforAddress_1 = __importDefault(require("./InforAddress"));
const env = process.env.NODE_ENV || 'development';
const config_1 = __importDefault(require("../../config/config"));
const cfg = config_1.default;
const db = {
    sequelize: {},
    InforAddress: {}
};
const dbPath = cfg[env].databases['infor'];
db.sequelize = new sequelize_1.Sequelize(dbPath.database, dbPath.username, dbPath.password, dbPath);
db.InforAddress = (0, InforAddress_1.default)(db.sequelize, sequelize_1.DataTypes);
exports.InforAddress = db.InforAddress;
//# sourceMappingURL=index.js.map