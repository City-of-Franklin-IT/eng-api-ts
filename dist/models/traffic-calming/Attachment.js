'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// Types
const sequelize_1 = require("sequelize");
exports.default = (sequelize, dataTypes) => {
    class Attachment extends sequelize_1.Model {
        static associate({ Petition }) {
            this.belongsTo(Petition, { targetKey: 'uuid', foreignKey: 'parentId' });
        }
        toJSON() {
            return { ...this.get(), id: undefined };
        }
    }
    Attachment.init({
        parentId: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        data: {
            type: sequelize_1.DataTypes.BLOB,
            allowNull: false
        },
        fileType: {
            type: sequelize_1.DataTypes.STRING,
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
        tableName: 'attachment',
        modelName: 'Attachment'
    });
    return Attachment;
};
//# sourceMappingURL=Attachment.js.map