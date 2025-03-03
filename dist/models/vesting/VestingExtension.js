'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// Types
const sequelize_1 = require("sequelize");
exports.default = (sequelize, dataTypes) => {
    class VestingExtension extends sequelize_1.Model {
        static associate({ VestingPeriod }) {
            this.belongsTo(VestingPeriod, { targetKey: 'uuid', foreignKey: 'parentId' });
        }
        toJSON() {
            return { ...this.get(), id: undefined };
        }
    }
    VestingExtension.init({
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
        tableName: 'vesting_extension',
        modelName: 'VestingExtension',
    });
    return VestingExtension;
};
//# sourceMappingURL=VestingExtension.js.map