'use strict'

// Types
import { Sequelize, Model, DataTypes, ModelStatic } from "sequelize"
import { VestingNotificationInterface, VestingNotificationCreationAttributes, ProjectInterface, ProjectCreationAttributes } from './types'
import handleDateOnly from '@utils/handleDateOnly'

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  class VestingNotifcation extends Model<VestingNotificationInterface, VestingNotificationCreationAttributes>{
    declare date: Date | string
    declare type: "Initial" | "Last Call" | "Lost Vesting"
    declare parentId: string
    declare uuid: string
    declare createdBy: string
    declare createdAt: Date
    declare updatedBy: string
    declare updatedAt: Date

    static associate({ Project }: { Project: ModelStatic<Model<ProjectInterface, ProjectCreationAttributes>> }) {
      this.belongsTo(Project, { targetKey: 'uuid', foreignKey: 'parentId' })
    }

    toJSON() {
      return { ...this.get(), id: undefined }
    }
  }

  VestingNotifcation.init({
    date: {
      type: DataTypes.DATEONLY,
      get(this: VestingNotifcation) {
        return handleDateOnly(this.getDataValue('date') as Date | string | null, 'YYYY-MM-DD')
      }
    },
    type: {
      type: DataTypes.STRING
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
    tableName: 'notification',
    modelName: 'VestingNotification',
  })

  return VestingNotifcation
}