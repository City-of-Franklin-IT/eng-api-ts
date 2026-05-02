'use strict';

// Types
import { Sequelize, Model, DataTypes, ModelStatic } from "sequelize"
import { ConstructionViolationInterface, ConstructionViolationCreationAttributes, SiteInterface, SiteCreationAttributes, FollowUpDateInterface, FollowUpDateCreationAttributes } from './types'
import handleDateOnly from '@utils/handleDateOnly'

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  class ConstructionViolation extends Model<ConstructionViolationInterface, ConstructionViolationCreationAttributes> {
    declare violationId: string
    declare date: string
    declare siteId: string
    declare details: string
    declare enforcementAction: string | null
    declare penaltyDate: string | null
    declare penaltyAmount: number | null
    declare penaltyDueDate: string | null
    declare paymentReceived: string | null
    declare swoDate: string | null
    declare swoLiftedDate: string | null
    declare complaintId: string | null
    declare compliance: boolean | null
    declare closed: boolean | null
    declare uuid: string
    declare createdBy: string
    declare createdAt: string
    declare updatedBy: string
    declare updatedAt: string

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
      get(this: ConstructionViolation) {
        return handleDateOnly(this.getDataValue('date') as Date | string | null, 'MM-DD-YYYY')
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
      get(this: ConstructionViolation) {
        return handleDateOnly(this.getDataValue('penaltyDate') as Date | string | null, 'MM-DD-YYYY')
      }
    },
    penaltyAmount: {
      type: dataTypes.DECIMAL
    },
    penaltyDueDate: {
      type: dataTypes.DATEONLY,
      get(this: ConstructionViolation) {
        return handleDateOnly(this.getDataValue('penaltyDueDate') as Date | string | null, 'MM-DD-YYYY')
      }
    },
    paymentReceived: {
      type: dataTypes.DATEONLY,
      get(this: ConstructionViolation) {
        return handleDateOnly(this.getDataValue('paymentReceived') as Date | string | null, 'MM-DD-YYYY')
      }
    },
    swoDate: {
      type: dataTypes.DATEONLY,
      get(this: ConstructionViolation) {
        return handleDateOnly(this.getDataValue('swoDate') as Date | string | null, 'MM-DD-YYYY')
      }
    },
    swoLiftedDate: {
      type: dataTypes.DATEONLY,
      get(this: ConstructionViolation) {
        return handleDateOnly(this.getDataValue('swoLiftedDate') as Date | string | null, 'MM-DD-YYYY')
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
    tableName: 'construction_violations',
    modelName: 'ConstructionViolation',
  })

  return ConstructionViolation
}