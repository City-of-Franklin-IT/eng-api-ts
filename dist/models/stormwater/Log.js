'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
// Types
const sequelize_1 = require("sequelize");
exports.default = (sequelize, dataTypes) => {
    class Log extends sequelize_1.Model {
        static assosciate({ Site }) {
            this.belongsTo(Site, { targetKey: 'siteId', foreignKey: 'siteId' });
        }
        toJSON() {
            return { ...this.get(), id: undefined };
        }
    }
    Log.init({
        logId: {
            type: dataTypes.STRING,
            allowNull: false,
        },
        siteId: {
            type: dataTypes.STRING,
            allowNull: false
        },
        inspectionDate: {
            type: dataTypes.DATEONLY,
            allowNull: false,
            get() {
                return (0, moment_1.default)(this.getDataValue('inspectionDate')).format('MM-DD-YYYY');
            }
        },
        uuid: {
            type: dataTypes.UUID,
            allowNull: false,
            defaultValue: dataTypes.UUIDV4
        },
        createdBy: {
            type: dataTypes.STRING,
            allowNull: false
        },
        createdAt: {
            type: dataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.Sequelize.fn('getdate')
        },
        updatedBy: {
            type: dataTypes.STRING,
            allowNull: false
        },
        updatedAt: {
            type: dataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.Sequelize.fn('getdate')
        }
    }, {
        sequelize,
        tableName: 'logs',
        modelName: 'Log',
    });
    return Log;
};
//# sourceMappingURL=Log.js.map