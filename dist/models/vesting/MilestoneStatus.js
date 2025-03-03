'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// Types
const sequelize_1 = require("sequelize");
exports.default = (sequelize, dataTypes) => {
    class MilestoneStatus extends sequelize_1.Model {
        static associate({ Milestone }) {
            this.belongsTo(Milestone, { targetKey: 'uuid', foreignKey: 'parentId' });
        }
        toJSON() {
            return { ...this.get(), id: undefined };
        }
    }
    MilestoneStatus.init({
        achieved: {
            type: sequelize_1.DataTypes.NUMBER,
            allowNull: true
        },
        expired: {
            type: sequelize_1.DataTypes.NUMBER,
            allowNull: true
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
        tableName: 'milestone_status',
        modelName: 'MilestoneStatus',
    });
    return MilestoneStatus;
};
//# sourceMappingURL=MilestoneStatus.js.map