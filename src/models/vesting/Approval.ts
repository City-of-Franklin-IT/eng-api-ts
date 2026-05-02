'use strict'

// Types
import { Sequelize, Model, DataTypes, ModelStatic } from "sequelize"
import { ApprovalInterface, ApprovalCreationAttributes, ProjectInterface, ProjectCreationAttributes } from './types'
import handleDateOnly from '@utils/handleDateOnly'

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  class Approval extends Model<ApprovalInterface, ApprovalCreationAttributes>{
    declare date: Date | string
    declare approvedBy: "FPMC" | "Admin" | "BOMA"
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

  Approval.init({
    date: {
      type: dataTypes.DATEONLY,
      get(this: Approval) {
        return handleDateOnly(this.getDataValue('date') as Date | string | null, 'YYYY-MM-DD')
      }
    },
    approvedBy: {
      type: dataTypes.STRING
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
    tableName: 'approval',
    modelName: 'Approval'
  })

  return Approval
}