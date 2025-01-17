'use strict'

// Types
import { Sequelize, Model, DataTypes, ModelStatic } from "sequelize"
import { VestingStatusInterface, VestingStatusCreationAttributes, VestingPeriodInterface, VestingPeriodCreationAttributes } from './types'

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  class VestingStatus extends Model<VestingStatusInterface, VestingStatusCreationAttributes>{
    declare achieved: boolean | null
    declare expired: boolean | null
    declare parentId: string
    declare uuid: string
    declare createdBy: string
    declare createdAt: Date
    declare updatedBy: string
    declare updatedAt: Date

    static associate({ VestingPeriod }: { VestingPeriod: ModelStatic<Model<VestingPeriodInterface, VestingPeriodCreationAttributes>> }) {
      this.belongsTo(VestingPeriod, { targetKey: 'uuid', foreignKey: 'parentId' })
    }

    toJSON() {
      return { ...this.get(), id: undefined }
    }
  }

  VestingStatus.init({
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
    tableName: 'vesting_status',
    modelName: 'VestingStatus',
  })

  return VestingStatus
}