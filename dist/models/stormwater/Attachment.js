'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// Types
const sequelize_1 = require("sequelize");
exports.default = (sequelize, dataTypes) => {
    class Attachment extends sequelize_1.Model {
        static associate({ Site }) {
            this.belongsTo(Site, { targetKey: 'uuid', foreignKey: 'parentId' });
        }
        toJSON() {
            return { ...this.get(), id: undefined };
        }
    }
    Attachment.init({
        parentId: {
            type: dataTypes.STRING,
            allowNull: false
        },
        data: {
            type: dataTypes.BLOB,
            allowNull: false
        },
        fileType: {
            type: dataTypes.STRING,
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
            allowNull: false,
            defaultValue: sequelize_1.Sequelize.fn('getdate')
        },
        updatedBy: {
            type: dataTypes.STRING,
            allowNull: false
        },
        updatedAt: {
            type: dataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.Sequelize.fn('getdate')
        }
    }, {
        sequelize,
        tableName: 'attachments',
        modelName: 'Attachment',
    });
    return Attachment;
};
//# sourceMappingURL=Attachment.js.map