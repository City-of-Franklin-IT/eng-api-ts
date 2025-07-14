'use strict';
import moment from "moment"

// Types
import { Sequelize, Model, DataTypes, ModelStatic } from "sequelize"
import { FollowUpDateInterface, FollowUpDateCreationAttributes, ComplaintInterface, ComplaintCreationAttributes, ConstructionViolationInterface, ConstructionViolationCreationAttributes, IllicitDischargeInterface, IllicitDischargeCreationAttributes } from './types'

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  class FollowUpDate extends Model<FollowUpDateInterface, FollowUpDateCreationAttributes> {
    declare followUpId: string
    declare violationId: string | null
    declare complaintId: string | null
    declare illicitId: string | null
    declare greenId: string | null
    declare followUpDate: string
    declare uuid: string
    declare createdBy: string
    declare createdAt: string
    declare updatedBy: string
    declare updatedAt: string

    static associate({ Complaint, ConstructionViolation, IllicitDischarge }: { Complaint: ModelStatic<Model<ComplaintInterface, ComplaintCreationAttributes>>, ConstructionViolation: ModelStatic<Model<ConstructionViolationInterface, ConstructionViolationCreationAttributes>>, IllicitDischarge: ModelStatic<Model<IllicitDischargeInterface, IllicitDischargeCreationAttributes>> }) {
      this.belongsTo(Complaint, { targetKey: 'complaintId', foreignKey: 'complaintId' })
      this.belongsTo(ConstructionViolation, { targetKey: 'violationId', foreignKey: 'violationId' })
      this.belongsTo(IllicitDischarge, { targetKey: 'illicitId', foreignKey: 'illicitId' })
    }

    toJSON() {
      return { ...this.get(), id: undefined }
    }
  }

  FollowUpDate.init({
    followUpId: {
      type: dataTypes.STRING,
      allowNull: false
    },
    violationId: {
      type: dataTypes.STRING,
    },
    complaintId: {
      type: dataTypes.STRING,
    },
    illicitId: {
      type: dataTypes.STRING,
    },
    greenId: {
      type: dataTypes.STRING,
    },
    followUpDate: {
      type: dataTypes.DATEONLY,
      allowNull: false,
      get() {
        return moment(this.getDataValue('followUpDate')).format('MM-DD-YYYY')
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
    tableName: 'follow_up_dates',
    modelName: 'FollowUpDate',
  })

  return FollowUpDate
}