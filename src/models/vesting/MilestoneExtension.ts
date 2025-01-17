'use strict'

// Types
import { Sequelize, Model, DataTypes, ModelStatic } from "sequelize"
import { MilestoneExtensionInterface, MilestoneExtensionCreationAttributes, MilestoneInterface, MilestoneCreationAttributes, MilestoneStatusInterface, MilestoneStatusCreationAttributes } from './types'

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  class MilestoneExtension extends Model<MilestoneExtensionInterface, MilestoneExtensionCreationAttributes>{
    declare date: Date | string
    declare parentId: string
    declare uuid: string
    declare createdBy: string
    declare createdAt: Date
    declare updatedBy: string
    declare updatedAt: Date

    static associate({ Milestone, MilestoneStatus }: { Milestone: ModelStatic<Model<MilestoneInterface, MilestoneCreationAttributes>>, MilestoneStatus: ModelStatic<Model<MilestoneStatusInterface, MilestoneStatusCreationAttributes>> }) {
      this.belongsTo(Milestone, { targetKey: 'uuid', foreignKey: 'parentId' })
      this.hasOne(MilestoneStatus, { sourceKey: 'uuid', foreignKey: 'parentId' })
    }

    toJSON() {
      return { ...this.get(), id: undefined }
    }
  }

  MilestoneExtension.init({
    date: {
      type: dataTypes.DATEONLY
    },
    parentId: {
      type: dataTypes.UUID
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
    tableName: 'extension',
    modelName: 'MilestoneExtension',
  })

  return MilestoneExtension
}