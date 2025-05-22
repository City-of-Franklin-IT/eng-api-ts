'use strict'
import moment from "moment"

// Types
import { Sequelize, Model, DataTypes, ModelStatic } from "sequelize"
import { IllicitDischargeInterface, IllicitDischargeCreationAttributes, FollowUpDateInterface, FollowUpDateCreationAttributes, SiteInterface, SiteCreationAttributes, InspectorInterface } from './types'

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  class IllicitDischarge extends Model<IllicitDischargeInterface, IllicitDischargeCreationAttributes>{
    declare illicitId: string
    declare complaintId: string | null
    declare siteId: string | null
    declare date: string
    declare xCoordinate: number
    declare yCoordinate: number
    declare locationDescription: string | null
    declare inspectorId: string | null
    declare details: string
    declare responsibleParty: string | null
    declare volumeLost: string | null
    declare streamWatershed: string
    declare enforcementAction: string | null
    declare penaltyDate: string | null
    declare penaltyAmount: number | null
    declare penaltyDueDate: string | null
    declare paymentReceived: string | null
    declare compliance: boolean | null
    declare closed: boolean | null
    declare uuid: string
    declare createdBy: string
    declare createdAt: string
    declare updatedBy: string
    declare updatedAt: string

    static associate({ Site, Inspector, FollowUpDate }: { Site: ModelStatic<Model<SiteInterface, SiteCreationAttributes>>, Inspector: ModelStatic<Model<InspectorInterface>>, FollowUpDate: ModelStatic<Model<FollowUpDateInterface, FollowUpDateCreationAttributes>> }) {
      this.belongsTo(Site, { targetKey: 'siteId', foreignKey: 'siteId' })
      this.hasOne(Inspector, { sourceKey: 'inspectorId', foreignKey: 'inspectorId' })
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
      type: dataTypes.FLOAT,
      allowNull: false
    },
    yCoordinate: {
      type: dataTypes.FLOAT,
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
    tableName: 'illicit_discharges',
    modelName: 'IllicitDischarge',
  })

  return IllicitDischarge
}