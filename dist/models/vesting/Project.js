'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// Types
const sequelize_1 = require("sequelize");
exports.default = (sequelize, dataTypes) => {
    class Project extends sequelize_1.Model {
        static associate({ Approval, Milestone, VestingNotification, Resolution, VestingPeriod }) {
            this.hasMany(Approval, { sourceKey: 'uuid', foreignKey: 'parentId' }),
                this.hasMany(Milestone, { sourceKey: 'uuid', foreignKey: 'parentId' }),
                this.hasMany(VestingNotification, { sourceKey: 'uuid', foreignKey: 'parentId' }),
                this.hasOne(Resolution, { sourceKey: 'uuid', foreignKey: 'parentId' }),
                this.hasMany(VestingPeriod, { sourceKey: 'uuid', foreignKey: 'parentId' });
        }
        toJSON() {
            return { ...this.get(), id: undefined };
        }
    }
    Project.init({
        type: {
            type: sequelize_1.DataTypes.STRING
        },
        name: {
            type: sequelize_1.DataTypes.STRING
        },
        cof: {
            type: sequelize_1.DataTypes.NUMBER,
            allowNull: true
        },
        ordinance: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: true
        },
        expired: {
            type: sequelize_1.DataTypes.NUMBER,
            allowNull: true,
            get() {
                const value = this.getDataValue('expired');
                return value === null ? null : !!value;
            }
        },
        notes: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true
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
            allowNull: false
        },
        updatedBy: {
            type: dataTypes.STRING,
            allowNull: false
        },
        updatedAt: {
            type: dataTypes.DATE,
            allowNull: false
        }
    }, {
        sequelize,
        freezeTableName: true,
        tableName: 'project',
        modelName: 'Project',
    });
    return Project;
};
//# sourceMappingURL=Project.js.map