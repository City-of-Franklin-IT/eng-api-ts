'use strict';

// Types
import { Sequelize, Model, DataTypes, ModelStatic } from "sequelize"
import { ContactInterface, ContactCreationAttributes, SiteContactInterface, SiteContactCreationAttributes } from './types'

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  class Contact extends Model<ContactInterface, ContactCreationAttributes> {
    declare contactId: string
    declare name: string
    declare phone: string | null
    declare company: string | null
    declare email: string | null
    declare inactive: boolean | null
    declare uuid: string
    declare createdBy: string
    declare createdAt: Date
    declare updatedBy: string
    declare updatedAt: Date

    static associate({ SiteContact }: { SiteContact: ModelStatic<Model<SiteContactInterface, SiteContactCreationAttributes>> }) {
      this.hasMany(SiteContact, { sourceKey: 'contactId', foreignKey: 'contactId' })
    }

    toJSON() {
      return { ...this.get(), id: undefined }
    }
  }

  Contact.init({
    contactId: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: dataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: dataTypes.STRING,
    },
    company: {
      type: dataTypes.STRING
    },
    email: {
      type: dataTypes.STRING
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
    tableName: 'contacts',
    modelName: 'Contact',
  })

  return Contact
}
