'use strict'
import moment from "moment"

// Types
import { Sequelize, Model, DataTypes, ModelStatic } from "sequelize"
import { SiteInterface, SiteCreationAttributes, LogInterface, LogCreationAttributes, ConstructionViolationInterface, ConstructionViolationCreationAttributes, ComplaintInterface, ComplaintCreationAttributes, IllicitDischargeInterface, IllicitDischargeCreationAttributes, SiteContactInterface, SiteContactCreationAttributes, InspectorInterface, InspectorCreationAttributes, AttachmentInterface, AttachmentCreationAttributes } from './types'

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  class Site extends Model<SiteInterface, SiteCreationAttributes>{
    declare siteId: string
    declare inspectorId: string | null
    declare name: string
    declare preconDate: Date | string
    declare location: string
    declare xCoordinate: string
    declare yCoordinate: string
    declare permit: string | null
    declare cof: string | null
    declare tnq: string | null
    declare greenInfrastructure: boolean | null
    declare inactive: boolean
    declare uuid: string
    declare createdBy: string
    declare createdAt: Date
    declare updatedBy: string
    declare updatedAt: Date

    static associate({ Log, ConstructionViolation, Complaint, IllicitDischarge, SiteContact, Inspector }: { Log: ModelStatic<Model<LogInterface, LogCreationAttributes>>, ConstructionViolation: ModelStatic<Model<ConstructionViolationInterface, ConstructionViolationCreationAttributes>>, Complaint: ModelStatic<Model<ComplaintInterface, ComplaintCreationAttributes>>, IllicitDischarge: ModelStatic<Model<IllicitDischargeInterface, IllicitDischargeCreationAttributes>>, SiteContact: ModelStatic<Model<SiteContactInterface, SiteContactCreationAttributes>>, Inspector: ModelStatic<Model<InspectorInterface, InspectorCreationAttributes>> }) {
      this.hasMany(Log, { sourceKey: 'siteId', foreignKey: 'siteId' })
      this.hasMany(ConstructionViolation, { sourceKey: 'siteId', foreignKey: 'siteId' })
      this.hasMany(Complaint, { sourceKey: 'siteId', foreignKey: 'siteId' })
      this.hasMany(IllicitDischarge, { sourceKey: 'siteId', foreignKey: 'siteId' })
      this.hasMany(SiteContact, { sourceKey: 'siteId', foreignKey: 'siteId' })
      this.hasOne(Inspector, { sourceKey: 'inspectorId', foreignKey: 'inspectorId' })
    }

    toJSON() {
      return { ...this.get(), id: undefined }
    }
  }

  Site.init({
    siteId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    inspectorId: {
      type: DataTypes.STRING,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    preconDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      get() {
        return this.getDataValue('preconDate') ? moment(this.getDataValue('preconDate')).format('MM-DD-YYYY') : null
      }
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    xCoordinate: {
      type: DataTypes.STRING,
      allowNull: false
    },
    yCoordinate: {
      type: DataTypes.STRING,
      allowNull: false
    },
    permit: {
      type: DataTypes.STRING
    },
    cof: {
      type: DataTypes.STRING
    },
    tnq: {
      type: DataTypes.STRING
    },
    greenInfrastructure: {
      type: DataTypes.NUMBER,
      get() {
        const value = this.getDataValue('greenInfrastructure')
        return value === null ? null : !!value
      }
    },
    inactive: {
      type: DataTypes.NUMBER,
      defaultValue: 0,
      get() {
        const value = this.getDataValue('inactive')
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
    tableName: 'sites',
    modelName: 'Site',
  })

  return Site
}