'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
// Types
const sequelize_1 = require("sequelize");
exports.default = (sequelize, dataTypes) => {
    class FollowUpDate extends sequelize_1.Model {
        static associate({ Complaint, ConstructionViolation, GreenInfrastructure, IllicitDischarge }) {
            this.belongsTo(Complaint, { targetKey: 'complaintId', foreignKey: 'complaintId' });
            this.belongsTo(ConstructionViolation, { targetKey: 'violationId', foreignKey: 'violationId' });
            this.belongsTo(GreenInfrastructure, { targetKey: 'greenId', foreignKey: 'greenId' });
            this.belongsTo(IllicitDischarge, { targetKey: 'illicitId', foreignKey: 'illicitId' });
        }
        toJSON() {
            return { ...this.get(), id: undefined };
        }
    }
    FollowUpDate.init({
        followUpId: {
            type: dataTypes.STRING,
            allowNull: false
        },
        violationId: {
            type: dataTypes.STRING,
        },
        complaintId: {
            type: dataTypes.STRING,
        },
        illicitId: {
            type: dataTypes.STRING,
        },
        greenId: {
            type: dataTypes.STRING,
        },
        followUpDate: {
            type: dataTypes.DATEONLY,
            allowNull: false,
            get() {
                return (0, moment_1.default)(this.getDataValue('followUpDate')).format('MM-DD-YYYY');
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
        tableName: 'follow_up_dates',
        modelName: 'FollowUpDate',
    });
    return FollowUpDate;
};
//# sourceMappingURL=FollowUpDate.js.map