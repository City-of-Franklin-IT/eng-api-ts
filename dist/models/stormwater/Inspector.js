'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// Types
const sequelize_1 = require("sequelize");
exports.default = (sequelize, dataTypes) => {
    class Inspector extends sequelize_1.Model {
        static associate({ Site, Complaint, IllicitDischarge, GreenInfrastructure }) {
            this.hasMany(Site, { sourceKey: 'inspectorId', foreignKey: 'inspectorId' });
            this.hasMany(Complaint, { sourceKey: 'inspectorId', foreignKey: 'inspectorId' });
            this.hasMany(IllicitDischarge, { sourceKey: 'inspectorId', foreignKey: 'inspectorId' });
            this.hasMany(GreenInfrastructure, { sourceKey: 'inspectorId', foreignKey: 'inspectorId' });
        }
        toJSON() {
            return { ...this.get(), id: undefined };
        }
    }
    Inspector.init({
        inspectorId: {
            type: dataTypes.STRING,
            allowNull: false
        },
        name: {
            type: dataTypes.STRING,
            allowNull: false
        },
        email: {
            type: dataTypes.STRING,
            allowNull: false
        },
        slug: {
            type: dataTypes.STRING,
        },
        inactive: {
            type: dataTypes.NUMBER,
            defaultValue: 0,
            get() {
                const value = this.getDataValue('inactive');
                return value === null ? null : !!value;
            }
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
        tableName: 'inspectors',
        modelName: 'Inspector'
    });
    return Inspector;
};
//# sourceMappingURL=Inspector.js.map