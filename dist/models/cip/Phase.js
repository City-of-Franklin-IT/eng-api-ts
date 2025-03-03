'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// Types
const sequelize_1 = require("sequelize");
exports.default = (sequelize, dataTypes) => {
    class Phase extends sequelize_1.Model {
        static associate({ Project }) {
            this.hasOne(Project, { sourceKey: 'parentId', foreignKey: 'uuid' });
        }
        toJSON() {
            return { ...this.get(), id: undefined };
        }
    }
    Phase.init({
        phase: {
            type: dataTypes.STRING,
            allowNull: false
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
        modelName: 'Phase',
        tableName: 'phase'
    });
    return Phase;
};
//# sourceMappingURL=Phase.js.map