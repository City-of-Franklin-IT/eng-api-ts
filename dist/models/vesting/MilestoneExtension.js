'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// Types
const sequelize_1 = require("sequelize");
exports.default = (sequelize, dataTypes) => {
    class MilestoneExtension extends sequelize_1.Model {
        static associate({ Milestone, MilestoneStatus }) {
            this.belongsTo(Milestone, { targetKey: 'uuid', foreignKey: 'parentId' });
            this.hasOne(MilestoneStatus, { sourceKey: 'uuid', foreignKey: 'parentId' });
        }
        toJSON() {
            return { ...this.get(), id: undefined };
        }
    }
    MilestoneExtension.init({
        date: {
            type: dataTypes.DATEONLY
        },
        parentId: {
            type: dataTypes.UUID
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
        tableName: 'extension',
        modelName: 'MilestoneExtension',
    });
    return MilestoneExtension;
};
//# sourceMappingURL=MilestoneExtension.js.map