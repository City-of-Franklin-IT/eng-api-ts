'use strict'

// Types
import { Sequelize, Model, DataTypes, ModelStatic } from "sequelize"
import { VestingExtensionInterface, VestingExtensionCreationAttributes, VestingPeriodInterface, VestingPeriodCreationAttributes } from './types'
import handleDateOnly from '@utils/handleDateOnly'

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  class VestingExtension extends Model<VestingExtensionInterface, VestingExtensionCreationAttributes>{
    declare type: "Development Plan" | "Preliminary Plat" | "Site Plan"
    declare name: string
    declare cof: number | null
    declare ordinance: Date | string | null
    declare expired: boolean | null
    declare notes: string | null

    static associate({ VestingPeriod }: { VestingPeriod: ModelStatic<Model<VestingPeriodInterface, VestingPeriodCreationAttributes>> }) {
      this.belongsTo(VestingPeriod, { targetKey: 'uuid', foreignKey: 'parentId' })
    }

    toJSON() {
      return { ...this.get(), id: undefined }
    }
  }

  VestingExtension.init({
    date: {
      type: DataTypes.DATEONLY,
      get(this: VestingExtension) {
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
    tableName: 'vesting_extension',
    modelName: 'VestingExtension',
  })

  return VestingExtension
}