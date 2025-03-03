'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// Types
const sequelize_1 = require("sequelize");
exports.default = (sequelize, dataTypes) => {
    class Respondent extends sequelize_1.Model {
        static associate({ Petition, Response }) {
            this.belongsTo(Petition, { targetKey: 'uuid', foreignKey: 'parentId' }),
                this.hasOne(Response, { sourceKey: 'uuid', foreignKey: 'parentId' });
        }
        toJSON() {
            return { ...this.get(), id: undefined };
        }
    }
    Respondent.init({
        name: {
            type: sequelize_1.DataTypes.STRING
        },
        address: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        ownerAddress: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        ownerCity: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        ownerState: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        ownerZIP: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        shortId: {
            type: sequelize_1.DataTypes.STRING
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
        tableName: 'respondent',
        modelName: 'Respondent',
    });
    return Respondent;
};
//# sourceMappingURL=Respondent.js.map