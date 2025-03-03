'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// Types
const sequelize_1 = require("sequelize");
exports.default = (sequelize, dataTypes) => {
    class Milestone extends sequelize_1.Model {
        static associate({ Project }) {
            this.hasOne(Project, { sourceKey: 'parentId', foreignKey: 'uuid' });
        }
        toJSON() {
            return { ...this.get(), id: undefined };
        }
    }
    Milestone.init({
        milestoneDesc: {
            type: dataTypes.STRING,
            allowNull: false
        },
        milestoneEst: {
            type: dataTypes.DATEONLY,
            allowNull: true
        },
        milestoneRealized: {
            type: dataTypes.DATEONLY,
            allowNull: true
        },
        parentId: {
            type: dataTypes.UUID,
            allowNull: false
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
        modelName: 'Milestone',
        tableName: 'milestone',
    });
    return Milestone;
};
//# sourceMappingURL=Milestone.js.map