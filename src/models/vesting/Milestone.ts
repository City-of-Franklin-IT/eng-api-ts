'use strict'

// Types
import { Sequelize, Model, DataTypes, ModelStatic } from "sequelize"
import { MilestoneInterface, MilestoneCreationAttributes, ProjectInterface, ProjectCreationAttributes, MilestoneStatusInterface, MilestoneStatusCreationAttributes, MilestoneExtensionInterface, MilestoneExtensionCreationAttributes } from './types'

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  class Milestone extends Model<MilestoneInterface, MilestoneCreationAttributes>{
    declare number: 1 | 2
    declare date: Date | string
    declare parentId: string
    declare uuid: string
    declare createdBy: string
    declare createdAt: Date
    declare updatedBy: string
    declare updatedAt: Date

    static associate({ Project, MilestoneStatus, MilestoneExtension }: { Project: ModelStatic<Model<ProjectInterface, ProjectCreationAttributes>>, MilestoneStatus: ModelStatic<Model<MilestoneStatusInterface, MilestoneStatusCreationAttributes>>, MilestoneExtension: ModelStatic<Model<MilestoneExtensionInterface, MilestoneExtensionCreationAttributes>> }) {
      this.belongsTo(Project, { targetKey: 'uuid', foreignKey: 'parentId' })
      this.hasOne(MilestoneStatus, { sourceKey: 'uuid', foreignKey: 'parentId' })
      this.hasOne(MilestoneExtension, { sourceKey: 'uuid', foreignKey: 'parentId' })
    }

    toJSON() {
      return { ...this.get(), id: undefined }
    }
  }

  Milestone.init({
    number: {
      type: DataTypes.NUMBER
    },
    date: {
      type: DataTypes.DATEONLY
    },
    parentId: {
      type: DataTypes.UUID
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
    tableName: 'milestone',
    modelName: 'Milestone',
  })

  return Milestone
}