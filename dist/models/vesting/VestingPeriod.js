'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// Types
const sequelize_1 = require("sequelize");
exports.default = (sequelize, dataTypes) => {
    class VestingPeriod extends sequelize_1.Model {
        static associate({ Project, VestingStatus, VestingExtension }) {
            this.belongsTo(Project, { targetKey: 'uuid', foreignKey: 'parentId' });
            this.hasOne(VestingStatus, { sourceKey: 'uuid', foreignKey: 'parentId' });
            this.hasOne(VestingExtension, { sourceKey: 'uuid', foreignKey: 'parentId' });
        }
        toJSON() {
            return { ...this.get(), id: undefined };
        }
    }
    VestingPeriod.init({
        type: {
            type: sequelize_1.DataTypes.STRING,
        },
        date: {
            type: sequelize_1.DataTypes.DATEONLY
        },
        parentId: {
            type: sequelize_1.DataTypes.UUID
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
        tableName: 'vesting_period',
        modelName: 'VestingPeriod',
    });
    return VestingPeriod;
};
//# sourceMappingURL=VestingPeriod.js.map