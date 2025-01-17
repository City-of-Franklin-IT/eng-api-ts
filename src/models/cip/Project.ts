'use strict';

// Types
import { Sequelize, Model, ModelStatic, DataTypes } from "sequelize"
import { ProjectInterface, ProjectCreationAttributes, UpdateInterface, UpdateCreationAttributes, PhaseInterface, PhaseCreationAttributes, MilestoneInterface, MilestoneCreationAttributes, SpendingInterface, SpendingCreationAttributes } from "./types"

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {

  class Project extends Model<ProjectInterface, ProjectCreationAttributes> {
    declare projectId: number
    declare name: string
    declare projectDescription: string | null
    declare type: string
    declare manager: string | null
    declare managerEmail: string | null
    declare link: string | null
    declare approvedBudget: number
    declare archived: boolean | null
    declare xCoordinate: string
    declare yCoordinate: string
    declare uuid: string
    declare createdBy: string
    declare updatedBy: string
    declare createdAt: Date
    declare updatedAt: Date

    static associate({ Update, Phase, Milestone, Spending }: { Update: ModelStatic<Model<UpdateInterface, UpdateCreationAttributes>>, Phase: ModelStatic<Model<PhaseInterface, PhaseCreationAttributes>>, Milestone: ModelStatic<Model<MilestoneInterface, MilestoneCreationAttributes>>, Spending: ModelStatic<Model<SpendingInterface, SpendingCreationAttributes>> }) {
      this.hasMany(Update, { sourceKey: 'uuid', foreignKey: 'parentId' })
      this.hasMany(Phase, { sourceKey: 'uuid', foreignKey: 'parentId' })
      this.hasMany(Milestone, { sourceKey: 'uuid', foreignKey: 'parentId' })
      this.hasMany(Spending, { as: 'Spending', sourceKey: 'uuid', foreignKey: 'parentId' })
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
        const value = this.getDataValue('archived')
        return value === null ? null : !!value
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
  })

  return Project
}