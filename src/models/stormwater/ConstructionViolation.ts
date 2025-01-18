'use strict';
import moment from "moment"

// Types
import { Sequelize, Model, DataTypes, ModelStatic } from "sequelize"
import { ConstructionViolationInterface, ConstructionViolationCreationAttributes, SiteInterface, SiteCreationAttributes, FollowUpDateInterface, FollowUpDateCreationAttributes } from './types'

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  class ConstructionViolation extends Model<ConstructionViolationInterface, ConstructionViolationCreationAttributes> {
    declare violationId: string
    declare date: Date | string
    declare siteId: string
    declare details: string
    declare enforcementAction: string | null
    declare penaltyDate: Date | string | null
    declare penaltyAmount: number | null
    declare penaltyDueDate: Date | string | null
    declare paymentReceived: Date | string | null
    declare swoDate: Date | string | null
    declare swoLiftedDate: Date | string | null
    declare complaintId: string | null
    declare compliance: boolean | null
    declare closed: boolean | null
    declare uuid: string
    declare createdBy: string
    declare createdAt: Date
    declare updatedBy: string
    declare updatedAt: Date

    static associate({ Site, FollowUpDate }: { Site: ModelStatic<Model<SiteInterface, SiteCreationAttributes>>, FollowUpDate: ModelStatic<Model<FollowUpDateInterface, FollowUpDateCreationAttributes>> }) {
      this.belongsTo(Site, { targetKey: 'siteId', foreignKey: 'siteId' })
      this.hasMany(FollowUpDate, { sourceKey: 'violationId', foreignKey: 'violationId' })
    }

    toJSON() {
      return { ...this.get(), id: undefined }
    }
  }

  ConstructionViolation.init({
    violationId: {
      type: dataTypes.STRING,
      allowNull: false
    },
    date: {
      type: dataTypes.DATEONLY,
      allowNull: false,
      get() {
        return moment(this.getDataValue('date')).format('MM-DD-YYYY')
      }
    },
    siteId: {
      type: dataTypes.STRING,
      allowNull: false
    },
    details: {
      type: dataTypes.STRING,
    },
    enforcementAction: {
      type: dataTypes.STRING
    },
    penaltyDate: {
      type: dataTypes.DATEONLY,
      get() {
        return this.getDataValue('penaltyDate') ? moment(this.getDataValue('penaltyDate')).format('MM-DD-YYYY') : null
      }
    },
    penaltyAmount: {
      type: dataTypes.DECIMAL
    },
    penaltyDueDate: {
      type: dataTypes.DATEONLY,
      get() {
        return this.getDataValue('penaltyDueDate') ? moment(this.getDataValue('penaltyDueDate')).format('MM-DD-YYYY') : null
      }
    },
    paymentReceived: {
      type: dataTypes.DATEONLY,
      get() {
        return this.getDataValue('paymentReceived') ? moment(this.getDataValue('paymentReceived')).format('MM-DD-YYYY') : null
      }
    },
    swoDate: {
      type: dataTypes.DATEONLY,
      get() {
        return this.getDataValue('swoDate') ? moment(this.getDataValue('swoDate')).format('MM-DD-YYYY') : null
      }
    },
    swoLiftedDate: {
      type: dataTypes.DATEONLY,
      get() {
        return this.getDataValue('swoLiftedDate') ? moment(this.getDataValue('swoLiftedDate')).format('MM-DD-YYYY') : null
      }
    },
    complaintId: {
      type: dataTypes.STRING
    },
    compliance: {
      type: dataTypes.NUMBER,
      defaultValue: 0,
      get() {
        const value = this.getDataValue('compliance')
        return value === null ? null : !!value
      }
    },
    closed: {
      type: dataTypes.NUMBER,
      defaultValue: 0,
      get() {
        const value = this.getDataValue('closed')
        return value === null ? null : !!value
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
    tableName: 'construction_violations',
    modelName: 'ConstructionViolation',
  })

  return ConstructionViolation
}