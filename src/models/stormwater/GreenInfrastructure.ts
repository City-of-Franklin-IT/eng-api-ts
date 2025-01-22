'use strict'
import moment from "moment"

// Types
import { Sequelize, Model, DataTypes, ModelStatic } from "sequelize"
import { GreenInfrastructureInterface, GreenInfrastructureCreationAttributes, FollowUpDateInterface, FollowUpDateCreationAttributes, InspectorInterface, InspectorCreationAttributes } from './types'

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  class GreenInfrastructure extends Model<GreenInfrastructureInterface, GreenInfrastructureCreationAttributes> {
    declare greenId: string
    declare date: Date | string
    declare xCoordinate: string
    declare yCoordinate: string
    declare locationDescription: string | null
    declare inspectorId: string | null
    declare details: string
    declare comments: string | null
    declare responsibleParty: string | null
    declare enforcementAction: string | null
    declare penaltyDate: Date | string | null
    declare penaltyAmount: number | null
    declare penaltyDueDate: Date | string | null
    declare paymentReceived: Date | string | null
    declare bondReleased: boolean | null
    declare compliance: boolean | null
    declare closed: boolean | null
    declare uuid: string
    declare createdBy: string
    declare createdAt: Date
    declare updatedBy: string
    declare updatedAt: Date

    static associate({ FollowUpDate, Inspector }: { FollowUpDate: ModelStatic<Model<FollowUpDateInterface, FollowUpDateCreationAttributes>>, Inspector: ModelStatic<Model<InspectorInterface, InspectorCreationAttributes>> }) {
      this.hasMany(FollowUpDate, { sourceKey: 'greenId', foreignKey: 'greenId' })
      this.hasOne(Inspector, { sourceKey: 'inspectorId', foreignKey: 'inspectorId' })
    }

    toJSON() {
      return { ...this.get(), id: undefined }
    }
  }

  GreenInfrastructure.init({
    greenId: {
      type: dataTypes.STRING,
      allowNull: false,
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
      type: dataTypes.STRING
    },
    inspectorId: {
      type: dataTypes.STRING,
    },
    details: {
      type: dataTypes.STRING,
      allowNull: false
    },
    comments: {
      type: dataTypes.STRING
    },
    responsibleParty: {
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
    bondReleased: {
      type: dataTypes.NUMBER,
      get() {
        const value = this.getDataValue('bondReleased')
        return value === null ? null : !!value
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
    tableName: 'green_infrastructure_violations',
    modelName: 'GreenInfrastructure',
  })

  return GreenInfrastructure
}