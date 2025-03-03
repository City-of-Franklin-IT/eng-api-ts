'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// Types
const sequelize_1 = require("sequelize");
exports.default = (sequelize, dataTypes) => {
    class Project extends sequelize_1.Model {
        static associate({ Update, Phase, Milestone, Spending }) {
            this.hasMany(Update, { sourceKey: 'uuid', foreignKey: 'parentId' });
            this.hasMany(Phase, { sourceKey: 'uuid', foreignKey: 'parentId' });
            this.hasMany(Milestone, { sourceKey: 'uuid', foreignKey: 'parentId' });
            this.hasMany(Spending, { as: 'Spending', sourceKey: 'uuid', foreignKey: 'parentId' });
        }
    }
    Project.init({
        projectId: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: dataTypes.STRING,
            allowNull: false,
        },
        projectDescription: {
            type: dataTypes.STRING,
        },
        type: {
            type: dataTypes.STRING,
            allowNull: false,
        },
        manager: {
            type: dataTypes.STRING
        },
        managerEmail: {
            type: dataTypes.STRING,
        },
        link: {
            type: dataTypes.STRING
        },
        approvedBudget: {
            type: dataTypes.INTEGER,
            allowNull: false
        },
        archived: {
            type: dataTypes.INTEGER,
            allowNull: true,
            get() {
                const value = this.getDataValue('archived');
                return value === null ? null : !!value;
            }
        },
        xCoordinate: {
            type: dataTypes.STRING,
            allowNull: false
        },
        yCoordinate: {
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
        modelName: 'Project',
        tableName: 'project',
        hasTrigger: true
    });
    return Project;
};
//# sourceMappingURL=Project.js.map