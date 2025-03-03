'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// Types
const sequelize_1 = require("sequelize");
exports.default = (sequelize, dataTypes) => {
    class VestingNotifcation extends sequelize_1.Model {
        static associate({ Project }) {
            this.belongsTo(Project, { targetKey: 'uuid', foreignKey: 'parentId' });
        }
        toJSON() {
            return { ...this.get(), id: undefined };
        }
    }
    VestingNotifcation.init({
        date: {
            type: sequelize_1.DataTypes.DATEONLY
        },
        type: {
            type: sequelize_1.DataTypes.STRING
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
        tableName: 'notification',
        modelName: 'VestingNotification',
    });
    return VestingNotifcation;
};
//# sourceMappingURL=VestingNotification.js.map