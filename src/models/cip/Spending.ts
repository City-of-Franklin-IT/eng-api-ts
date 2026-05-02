'use strict'

// Types
import { Sequelize, Model, ModelStatic, DataTypes } from "sequelize"
import { SpendingInterface, SpendingCreationAttributes, ProjectInterface, ProjectCreationAttributes } from './types'
import handleDateOnly from '@utils/handleDateOnly'

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {

  class Spending extends Model<SpendingInterface,SpendingCreationAttributes> {
    declare dollarsSpent: number
    declare dollarsSpentDate: Date
    declare parentId: string
    declare uuid: string
    declare createdBy: string
    declare createdAt: Date
    declare updatedBy: string
    declare updatedAt: Date

    static associate({ Project }: { Project: ModelStatic<Model<ProjectInterface, ProjectCreationAttributes>> }) {
      this.hasOne(Project, { sourceKey: 'parentId', foreignKey: 'uuid' })
    }
    
    toJSON() {
      return { ...this.get(), id: undefined }
    }
  }

  Spending.init({
    dollarsSpent: {
      type: dataTypes.INTEGER,
      allowNull: false
    },
    dollarsSpentDate: {
      type: dataTypes.DATEONLY,
      allowNull: false,
      get(this: Spending) {
        return handleDateOnly(this.getDataValue('dollarsSpentDate') as Date | string | null, 'YYYY-MM-DD')
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
    modelName: 'Spending',
    tableName: 'spending'
  })

  return Spending
}