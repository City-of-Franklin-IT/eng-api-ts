'use strict'

// Types
import { Sequelize, Model, DataTypes, ModelStatic } from "sequelize"
import { LogInterface, LogCreationAttributes, SiteInterface, SiteCreationAttributes } from './types'
import handleDateOnly from '@utils/handleDateOnly'

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  class Log extends Model<LogInterface, LogCreationAttributes>{
    declare logId: string
    declare siteId: string
    declare inspectionDate: string
    declare uuid: string
    declare createdBy: string
    declare createdAt: string
    declare updatedBy: string
    declare updatedAt: string

    static associate({ Site }: { Site: ModelStatic<Model<SiteInterface, SiteCreationAttributes>> }) {
      this.belongsTo(Site, { targetKey: 'siteId', foreignKey: 'siteId' })
    }

    toJSON() {
      return { ...this.get(), id: undefined }
    }
  }

  Log.init({
    logId: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    siteId: {
      type: dataTypes.STRING,
      allowNull: false
    },
    inspectionDate: {
      type: dataTypes.DATEONLY,
      allowNull: false,
      get(this: Log) {
        return handleDateOnly(this.getDataValue('inspectionDate') as Date | string | null, 'MM-DD-YYYY')
      }
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
      allowNull: false,
      defaultValue: Sequelize.fn('getdate')
    },
    updatedBy: {
      type: dataTypes.STRING,
      allowNull: false
    },
    updatedAt: {
      type: dataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('getdate')
    }
  }, {
    sequelize,
    tableName: 'logs',
    modelName: 'Log',
  })

  return Log
}