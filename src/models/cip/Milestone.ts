'use strict';

// Types
import { Sequelize, Model, ModelStatic, DataTypes } from "sequelize"
import { MilestoneInterface, MilestoneCreationAttributes, ProjectInterface, ProjectCreationAttributes } from "./types"
import handleDateOnly from '@utils/handleDateOnly'

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {

  class Milestone extends Model<MilestoneInterface,MilestoneCreationAttributes> {
    declare milestoneDesc: string
    declare milestoneEst: string | null
    declare milestoneRealized: string | null
    declare parentId: string
    declare uuid: string
    declare createdBy: string
    declare createdAt: string
    declare updatedBy: string
    declare updatedAt: string

    static associate({ Project }: { Project: ModelStatic<Model<ProjectInterface, ProjectCreationAttributes>> }) {
      this.hasOne(Project, { sourceKey: 'parentId', foreignKey: 'uuid' })
    }
    
    toJSON() {
      return { ...this.get(), id: undefined }
    }
  }

  Milestone.init({
    milestoneDesc: {
      type: dataTypes.STRING,
      allowNull: false
    },
    milestoneEst: {
      type: dataTypes.DATEONLY,
      allowNull: true,
      get(this: Milestone) {
        return handleDateOnly(this.getDataValue('milestoneEst') as Date | string | null, 'YYYY-MM-DD')
      }
    },
    milestoneRealized: {
      type: dataTypes.DATEONLY,
      allowNull: true,
      get(this: Milestone) {
        return handleDateOnly(this.getDataValue('milestoneRealized') as Date | string | null, 'YYYY-MM-DD')
      }
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
    modelName: 'Milestone',
    tableName: 'milestone',
  })

  return Milestone
}