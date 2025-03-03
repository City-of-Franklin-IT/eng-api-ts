'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// Types
const sequelize_1 = require("sequelize");
exports.default = (sequelize, dataTypes) => {
    class Approval extends sequelize_1.Model {
        static associate({ Project }) {
            this.belongsTo(Project, { targetKey: 'uuid', foreignKey: 'parentId' });
        }
        toJSON() {
            return { ...this.get(), id: undefined };
        }
    }
    Approval.init({
        date: {
            type: dataTypes.DATEONLY
        },
        approvedBy: {
            type: dataTypes.STRING
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
        tableName: 'approval',
        modelName: 'Approval'
    });
    return Approval;
};
//# sourceMappingURL=Approval.js.map