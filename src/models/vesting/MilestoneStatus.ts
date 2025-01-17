'use strict'

// Types
import { Sequelize, Model, DataTypes, ModelStatic } from "sequelize"
import { MilestoneStatusInterface, MilestoneStatusCreationAttributes } from './types'

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  class MilestoneStatus extends Model<MilestoneStatusInterface, MilestoneStatusCreationAttributes>{
    declare achieved: boolean | null
    declare expired: boolean | null
    declare parentId: string
    declare uuid: string
    declare createdBy: string
    declare createdAt: Date
    declare updatedBy: string
    declare updatedAt: Date

    static associate({ Milestone }: { Milestone: ModelStatic<Model<MilestoneStatusInterface, MilestoneStatusCreationAttributes>> }) {
      this.belongsTo(Milestone, { targetKey: 'uuid', foreignKey: 'parentId' })
    }

    toJSON() {
      return { ...this.get(), id: undefined }
    }
  }

  MilestoneStatus.init({
    achieved: {
      type: DataTypes.NUMBER,
      allowNull: true
    },
    expired: {
      type: DataTypes.NUMBER,
      allowNull: true
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
    tableName: 'milestone_status',
    modelName: 'MilestoneStatus',
  })

  return MilestoneStatus
}