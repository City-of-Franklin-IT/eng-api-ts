'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
// Types
const sequelize_1 = require("sequelize");
exports.default = (sequelize, dataTypes) => {
    class Site extends sequelize_1.Model {
        static associate({ Log, ConstructionViolation, Complaint, IllicitDischarge, SiteContact, Inspector, Attachment }) {
            this.hasMany(Log, { sourceKey: 'siteId', foreignKey: 'siteId' });
            this.hasMany(ConstructionViolation, { sourceKey: 'siteId', foreignKey: 'siteId' });
            this.hasMany(Complaint, { sourceKey: 'siteId', foreignKey: 'siteId' });
            this.hasMany(IllicitDischarge, { sourceKey: 'siteId', foreignKey: 'siteId' });
            this.hasMany(SiteContact, { sourceKey: 'siteId', foreignKey: 'siteId' });
            this.hasOne(Inspector, { sourceKey: 'inspectorId', foreignKey: 'inspectorId' });
            this.hasMany(Attachment, { sourceKey: 'uuid', foreignKey: 'parentId' });
        }
        toJSON() {
            return { ...this.get(), id: undefined };
        }
    }
    Site.init({
        siteId: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        inspectorId: {
            type: sequelize_1.DataTypes.STRING,
        },
        name: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        preconDate: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: false,
            get() {
                return this.getDataValue('preconDate') ? (0, moment_1.default)(this.getDataValue('preconDate')).format('MM-DD-YYYY') : null;
            }
        },
        location: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        xCoordinate: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        yCoordinate: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        permit: {
            type: sequelize_1.DataTypes.STRING
        },
        cof: {
            type: sequelize_1.DataTypes.STRING
        },
        tnq: {
            type: sequelize_1.DataTypes.STRING
        },
        greenInfrastructure: {
            type: sequelize_1.DataTypes.NUMBER,
            get() {
                const value = this.getDataValue('greenInfrastructure');
                return value === null ? null : !!value;
            }
        },
        inactive: {
            type: sequelize_1.DataTypes.NUMBER,
            defaultValue: 0,
            get() {
                const value = this.getDataValue('inactive');
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
        tableName: 'sites',
        modelName: 'Site',
    });
    return Site;
};
//# sourceMappingURL=Site.js.map