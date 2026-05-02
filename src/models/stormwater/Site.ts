'use strict'

// Types
import { Sequelize, Model, DataTypes, ModelStatic } from "sequelize"
import { SiteInterface, SiteCreationAttributes, LogInterface, LogCreationAttributes, ConstructionViolationInterface, ConstructionViolationCreationAttributes, ComplaintInterface, ComplaintCreationAttributes, IllicitDischargeInterface, IllicitDischargeCreationAttributes, SiteContactInterface, SiteContactCreationAttributes, InspectorInterface, InspectorCreationAttributes, InactiveSiteInterface, InactiveSiteCreateInterface, IncompleteSiteInterface, IncompleteSiteCreateInterface } from './types'
import handleDateOnly from '@utils/handleDateOnly'

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  class Site extends Model<SiteInterface, SiteCreationAttributes>{
    declare siteId: string
    declare inspectorId: string | null
    declare name: string
    declare preconDate: string
    declare location: string
    declare xCoordinate: number
    declare yCoordinate: number
    declare permit: string | null
    declare cof: string | null
    declare tnq: string | null
    declare greenInfrastructure: boolean | null
    declare uuid: string
    declare createdBy: string
    declare createdAt: string
    declare updatedBy: string
    declare updatedAt: string

    static associate({ Log, ConstructionViolation, Complaint, IllicitDischarge, SiteContact, Inspector, InactiveSite, IncompleteSite }: { Log: ModelStatic<Model<LogInterface, LogCreationAttributes>>, ConstructionViolation: ModelStatic<Model<ConstructionViolationInterface, ConstructionViolationCreationAttributes>>, Complaint: ModelStatic<Model<ComplaintInterface, ComplaintCreationAttributes>>, IllicitDischarge: ModelStatic<Model<IllicitDischargeInterface, IllicitDischargeCreationAttributes>>, SiteContact: ModelStatic<Model<SiteContactInterface, SiteContactCreationAttributes>>, Inspector: ModelStatic<Model<InspectorInterface, InspectorCreationAttributes>>, InactiveSite: ModelStatic<Model<InactiveSiteInterface, InactiveSiteCreateInterface>>, IncompleteSite: ModelStatic<Model<IncompleteSiteInterface, IncompleteSiteCreateInterface>> }) {
      this.hasMany(Log, { sourceKey: 'siteId', foreignKey: 'siteId' })
      this.hasMany(ConstructionViolation, { sourceKey: 'siteId', foreignKey: 'siteId' })
      this.hasMany(Complaint, { sourceKey: 'siteId', foreignKey: 'siteId' })
      this.hasMany(IllicitDischarge, { sourceKey: 'siteId', foreignKey: 'siteId' })
      this.hasMany(SiteContact, { sourceKey: 'siteId', foreignKey: 'siteId' })
      this.hasOne(Inspector, { sourceKey: 'inspectorId', foreignKey: 'inspectorId' })
      this.hasOne(InactiveSite, { sourceKey: 'siteId', foreignKey: 'siteId' })
      this.hasOne(IncompleteSite, { sourceKey: 'siteId', foreignKey: 'siteId' })
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
      get(this: Site) {
        return handleDateOnly(this.getDataValue('preconDate') as Date | string | null, 'MM-DD-YYYY')
      }
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    xCoordinate: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    yCoordinate: {
      type: DataTypes.FLOAT,
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