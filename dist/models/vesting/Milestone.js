'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// Types
const sequelize_1 = require("sequelize");
exports.default = (sequelize, dataTypes) => {
    class Milestone extends sequelize_1.Model {
        static associate({ Project, MilestoneStatus, MilestoneExtension }) {
            this.belongsTo(Project, { targetKey: 'uuid', foreignKey: 'parentId' });
            this.hasOne(MilestoneStatus, { sourceKey: 'uuid', foreignKey: 'parentId' });
            this.hasOne(MilestoneExtension, { sourceKey: 'uuid', foreignKey: 'parentId' });
        }
        toJSON() {
            return { ...this.get(), id: undefined };
        }
    }
    Milestone.init({
        number: {
            type: sequelize_1.DataTypes.NUMBER
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
        tableName: 'milestone',
        modelName: 'Milestone',
    });
    return Milestone;
};
//# sourceMappingURL=Milestone.js.map