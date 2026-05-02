'use strict'

// Types
import { Sequelize, Model, DataTypes, ModelStatic } from "sequelize"
import { VestingPeriodInterface, VestingPeriodCreationAttributes, ProjectInterface, ProjectCreationAttributes, VestingStatusInterface, VestingStatusCreationAttributes, VestingExtensionInterface, VestingExtensionCreationAttributes } from './types'
import handleDateOnly from '@utils/handleDateOnly'

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  class VestingPeriod extends Model<VestingPeriodInterface, VestingPeriodCreationAttributes>{
    declare type: "10Y" | "15Y"
    declare date: Date | string
    declare parentId: string
    declare uuid: string
    declare createdBy: string
    declare createdAt: Date
    declare updatedBy: string
    declare updatedAt: Date

    static associate({ Project, VestingStatus, VestingExtension }: { Project: ModelStatic<Model<ProjectInterface, ProjectCreationAttributes>>, VestingStatus: ModelStatic<Model<VestingStatusInterface, VestingStatusCreationAttributes>>, VestingExtension: ModelStatic<Model<VestingExtensionInterface, VestingExtensionCreationAttributes>> }) {
      this.belongsTo(Project, { targetKey: 'uuid', foreignKey: 'parentId' })
      this.hasOne(VestingStatus, { sourceKey: 'uuid', foreignKey: 'parentId' })
      this.hasOne(VestingExtension, { sourceKey: 'uuid', foreignKey: 'parentId' })
    }

    toJSON() {
      return { ...this.get(), id: undefined }
    }
  }

  VestingPeriod.init({
    type: {
      type: DataTypes.STRING,
    },
    date: {
      type: DataTypes.DATEONLY,
      get(this: VestingPeriod) {
        return handleDateOnly(this.getDataValue('date') as Date | string | null, 'YYYY-MM-DD')
      }
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
    tableName: 'vesting_period',
    modelName: 'VestingPeriod',
  })

  return VestingPeriod
}