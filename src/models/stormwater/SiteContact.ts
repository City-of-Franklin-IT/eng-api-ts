'use strict'

// Types
import { Sequelize, Model, DataTypes, ModelStatic } from "sequelize"
import { SiteContactInterface, SiteContactCreationAttributes } from './types'

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  class SiteContact extends Model<SiteContactInterface, SiteContactCreationAttributes>{
    declare siteId: string
    declare contactId: string
    declare isPrimary: boolean
    declare isContractor: boolean
    declare isInspector: boolean
    declare uuid: string
    declare createdBy: string
    declare createdAt: string
    declare updatedBy: string
    declare updatedAt: string

    static associate({ Contact, Site }: { Contact: ModelStatic<Model>, Site: ModelStatic<Model> }) {
      this.belongsTo(Contact, { targetKey: 'contactId', foreignKey: 'contactId' })
      this.belongsTo(Site, { targetKey: 'siteId', foreignKey: 'siteId' })
    }

    toJSON() {
      return { ...this.get(), id: undefined }
    }
  }

  SiteContact.init({
    siteId: {
      type: dataTypes.STRING,
      allowNull: false
    },
    contactId: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    isPrimary: {
      type: dataTypes.NUMBER,
      defaultValue: false,
      get() {
        const value = this.getDataValue('isPrimary')
        return value === null ? null : !!value
      }
    },
    isContractor: {
      type: dataTypes.NUMBER,
      defaultValue: false,
      get() {
        const value = this.getDataValue('isContractor')
        return value === null ? null : !!value
      }
    },
    isInspector: {
      type: dataTypes.NUMBER,
      defaultValue: false,
      get() {
        const value = this.getDataValue('isInspector')
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
    tableName: 'site_contacts',
    modelName: 'SiteContact',
  })

  return SiteContact
}