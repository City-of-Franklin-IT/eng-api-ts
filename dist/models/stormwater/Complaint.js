'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
// Types
const sequelize_1 = require("sequelize");
exports.default = (sequelize, dataTypes) => {
    class Complaint extends sequelize_1.Model {
        static associate({ Inspector, FollowUpDate, Site }) {
            this.belongsTo(Site, { targetKey: 'siteId', foreignKey: 'siteId' });
            this.hasOne(Inspector, { sourceKey: 'inspectorId', foreignKey: 'inspectorId' });
            this.hasMany(FollowUpDate, { sourceKey: 'complaintId', foreignKey: 'complaintId' });
        }
        toJSON() {
            return { ...this.get(), id: undefined };
        }
    }
    Complaint.init({
        complaintId: {
            type: dataTypes.STRING,
            allowNull: false
        },
        date: {
            type: dataTypes.DATEONLY,
            allowNull: false,
            get() {
                const date = this.getDataValue('date') ? (0, moment_1.default)(this.getDataValue('date')).format('MM-DD-YYYY') : null;
                return date;
            }
        },
        siteId: {
            type: dataTypes.STRING,
        },
        inspectorId: {
            type: dataTypes.STRING,
        },
        name: {
            type: dataTypes.STRING
        },
        address: {
            type: dataTypes.STRING
        },
        phone: {
            type: dataTypes.STRING
        },
        email: {
            type: dataTypes.STRING
        },
        xCoordinate: {
            type: dataTypes.STRING,
        },
        yCoordinate: {
            type: dataTypes.STRING,
        },
        locationDescription: {
            type: dataTypes.STRING
        },
        concern: {
            type: dataTypes.STRING,
            allowNull: false
        },
        otherConcern: {
            type: dataTypes.STRING
        },
        details: {
            type: dataTypes.STRING,
            allowNull: false
        },
        responsibleParty: {
            type: dataTypes.STRING
        },
        comments: {
            type: dataTypes.STRING
        },
        compliance: {
            type: dataTypes.NUMBER,
            defaultValue: 0,
            get() {
                const value = this.getDataValue('compliance');
                return value === null ? null : !!value;
            }
        },
        closed: {
            type: dataTypes.NUMBER,
            defaultValue: 0,
            get() {
                const value = this.getDataValue('closed');
                return value === null ? null : !!value;
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
        tableName: 'complaints',
        modelName: 'Complaint',
    });
    return Complaint;
};
//# sourceMappingURL=Complaint.js.map