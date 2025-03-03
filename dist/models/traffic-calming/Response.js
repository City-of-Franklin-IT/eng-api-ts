'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// Types
const sequelize_1 = require("sequelize");
exports.default = (sequelize, dataTypes) => {
    class Response extends sequelize_1.Model {
        static associate({ Respondent }) {
            this.belongsTo(Respondent, { targetKey: 'uuid', foreignKey: 'parentId' });
        }
        toJSON() {
            return { ...this.get(), id: undefined };
        }
    }
    Response.init({
        response: {
            type: sequelize_1.DataTypes.NUMBER
        },
        parentId: {
            type: sequelize_1.DataTypes.UUID
        },
        uuid: {
            type: dataTypes.UUID,
            allowNull: false,
            defaultValue: dataTypes.UUIDV4
        },
        createdAt: {
            type: dataTypes.DATE,
            allowNull: false
        },
        updatedAt: {
            type: dataTypes.DATE,
            allowNull: false
        }
    }, {
        sequelize,
        freezeTableName: true,
        tableName: 'response',
        modelName: 'Response',
    });
    return Response;
};
//# sourceMappingURL=Response.js.map