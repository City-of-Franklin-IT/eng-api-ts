'use strict'
import moment from "moment"

// Types
import { Sequelize, Model, DataTypes, ModelStatic } from "sequelize"
import { IllicitDischargeInterface, IllicitDischargeCreationAttributes, FollowUpDateInterface, FollowUpDateCreationAttributes, SiteInterface, SiteCreationAttributes } from './types'

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  class IllicitDischarge extends Model<IllicitDischargeInterface, IllicitDischargeCreationAttributes>{
    declare illicitId: string
    declare complaintId: string | null
    declare siteId: string | null
    declare date: Date | string
    declare xCoordinate: string
    declare yCoordinate: string
    declare locationDescription: string | null
    declare inspectorId: string | null
    declare details: string
    declare responsibleParty: string | null
    declare volumeLost: string | null
    declare streamWatershed: string
    declare enforcementAction: string | null
    declare penaltyDate: Date | string | null
    declare penaltyAmount: number | null
    declare penaltyDueDate: Date | string | null
    declare paymentReceived: Date | string | null
    declare compliance: boolean | null
    declare closed: boolean | null
    declare uuid: string
    declare createdBy: string
    declare createdAt: Date
    declare updatedBy: string
    declare updatedAt: Date

    static associate({ Site, FollowUpDate }: { Site: ModelStatic<Model<SiteInterface, SiteCreationAttributes>>, FollowUpDate: ModelStatic<Model<FollowUpDateInterface, FollowUpDateCreationAttributes>> }) {
      this.belongsTo(Site, { targetKey: 'siteId', foreignKey: 'siteId' })
      this.hasMany(FollowUpDate, { sourceKey: 'illicitId', foreignKey: 'illicitId' })
    }

    toJSON() {
      return { ...this.get(), id: undefined }
    }
  }

  IllicitDischarge.init({
    illicitId: {
      type: dataTypes.STRING,
      allowNull: false
    },
    complaintId: {
      type: dataTypes.STRING
    },
    siteId: {
      type: dataTypes.STRING
    },
    date: {
      type: dataTypes.DATEONLY,
      allowNull: false,
      get() {
        return moment(this.getDataValue('date')).format('MM-DD-YYYY')
      }
    },
    xCoordinate: {
      type: dataTypes.STRING,
      allowNull: false
    },
    yCoordinate: {
      type: dataTypes.STRING,
      allowNull: false
    },
    locationDescription: {
      type: dataTypes.STRING,
    },
    inspectorId: {
      type: dataTypes.STRING,
    },
    details: {
      type: dataTypes.STRING,
      allowNull: false
    },
    responsibleParty: {
      type: dataTypes.STRING
    },
    volumeLost: {
      type: dataTypes.STRING
    },
    streamWatershed: {
      type: dataTypes.STRING
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
    tableName: 'illicit_discharges',
    modelName: 'IllicitDischarge',
  })

  return IllicitDischarge
}