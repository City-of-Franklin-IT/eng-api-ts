'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
// Types
const sequelize_1 = require("sequelize");
exports.default = (sequelize, dataTypes) => {
    class GreenInfrastructure extends sequelize_1.Model {
        static associate({ FollowUpDate, Inspector }) {
            this.hasMany(FollowUpDate, { sourceKey: 'greenId', foreignKey: 'greenId' });
            this.hasOne(Inspector, { sourceKey: 'inspectorId', foreignKey: 'inspectorId' });
        }
        toJSON() {
            return { ...this.get(), id: undefined };
        }
    }
    GreenInfrastructure.init({
        greenId: {
            type: dataTypes.STRING,
            allowNull: false,
        },
        date: {
            type: dataTypes.DATEONLY,
            allowNull: false,
            get() {
                return (0, moment_1.default)(this.getDataValue('date')).format('MM-DD-YYYY');
            }
        },
        xCoordinate: {
            type: dataTypes.STRING,
            allowNull: false
        },
        yCoordinate: {
            type: dataTypes.STRING,
            allowNull: false
        },
        locationDescription: {
            type: dataTypes.STRING
        },
        inspectorId: {
            type: dataTypes.STRING,
        },
        details: {
            type: dataTypes.STRING,
            allowNull: false
        },
        comments: {
            type: dataTypes.STRING
        },
        responsibleParty: {
            type: dataTypes.STRING
        },
        enforcementAction: {
            type: dataTypes.STRING
        },
        penaltyDate: {
            type: dataTypes.DATEONLY,
            get() {
                return this.getDataValue('penaltyDate') ? (0, moment_1.default)(this.getDataValue('penaltyDate')).format('MM-DD-YYYY') : null;
            }
        },
        penaltyAmount: {
            type: dataTypes.DECIMAL
        },
        penaltyDueDate: {
            type: dataTypes.DATEONLY,
            get() {
                return this.getDataValue('penaltyDueDate') ? (0, moment_1.default)(this.getDataValue('penaltyDueDate')).format('MM-DD-YYYY') : null;
            }
        },
        paymentReceived: {
            type: dataTypes.DATEONLY,
            get() {
                return this.getDataValue('paymentReceived') ? (0, moment_1.default)(this.getDataValue('paymentReceived')).format('MM-DD-YYYY') : null;
            }
        },
        bondReleased: {
            type: dataTypes.NUMBER,
            get() {
                const value = this.getDataValue('bondReleased');
                return value === null ? null : !!value;
            }
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
        tableName: 'green_infrastructure_violations',
        modelName: 'GreenInfrastructure',
    });
    return GreenInfrastructure;
};
//# sourceMappingURL=GreenInfrastructure.js.map