'use strict'

// Types
import { Sequelize, Model, DataTypes, ModelStatic } from "sequelize"
import { InspectorInterface, InspectorCreationAttributes, ComplaintInterface, ComplaintCreationAttributes, IllicitDischargeInterface, IllicitDischargeCreationAttributes, GreenInfrastructureInterface, GreenInfrastructureCreationAttributes, SiteInterface, SiteCreationAttributes } from './types'

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  class Inspector extends Model<InspectorInterface, InspectorCreationAttributes>{
    declare inspectorId: string
    declare name: string
    declare email: string
    declare slug: string
    declare inactive: boolean | null
    declare uuid: string
    declare createdBy: string
    declare createdAt: Date
    declare updatedBy: string
    declare updatedAt: Date

    static associate({ Site, Complaint, IllicitDischarge, GreenInfrastructure }: { Site: ModelStatic<Model<SiteInterface, SiteCreationAttributes>>, Complaint: ModelStatic<Model<ComplaintInterface, ComplaintCreationAttributes>>, IllicitDischarge: ModelStatic<Model<IllicitDischargeInterface, IllicitDischargeCreationAttributes>>, GreenInfrastructure: ModelStatic<Model<GreenInfrastructureInterface, GreenInfrastructureCreationAttributes>> }) {
      this.hasMany(Site, { sourceKey: 'inspectorId', foreignKey: 'inspectorId' })
      this.hasMany(Complaint, { sourceKey: 'inspectorId', foreignKey: 'inspectorId' })
      this.hasMany(IllicitDischarge, { sourceKey: 'inspectorId', foreignKey: 'inspectorId' })
      this.hasMany(GreenInfrastructure, { sourceKey: 'inspectorId', foreignKey: 'inspectorId' })
    }

    toJSON() {
      return { ...this.get(), id: undefined }
    }
  }

  Inspector.init({
    inspectorId: {
      type: dataTypes.STRING,
      allowNull: false
    },
    name: {
      type: dataTypes.STRING,
      allowNull: false
    },
    email: {
      type: dataTypes.STRING,
      allowNull: false
    },
    slug: {
      type: dataTypes.STRING,
    },
    inactive: {
      type: dataTypes.NUMBER,
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
    tableName: 'inspectors',
    modelName: 'Inspector',
  })

  return Inspector
}