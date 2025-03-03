'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// Types
const sequelize_1 = require("sequelize");
exports.default = (sequelize, dataTypes) => {
    class Petition extends sequelize_1.Model {
        static associate({ Respondent, Attachment }) {
            this.hasMany(Respondent, { sourceKey: 'uuid', foreignKey: 'parentId' });
            this.hasOne(Attachment, { sourceKey: 'uuid', foreignKey: 'parentId' });
        }
        toJSON() {
            return { ...this.get(), id: undefined };
        }
    }
    Petition.init({
        petitionId: {
            type: sequelize_1.DataTypes.STRING
        },
        description: {
            type: sequelize_1.DataTypes.TEXT
        },
        startDate: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: true
        },
        endDate: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: true
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
        tableName: 'petition',
        modelName: 'Petition'
    });
    return Petition;
};
//# sourceMappingURL=Petition.js.map