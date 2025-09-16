'use strict'

// Types
import { Sequelize, Model, DataTypes, ModelStatic } from "sequelize"
import { InactiveSiteInterface, InactiveSiteCreateInterface, SiteInterface, SiteCreationAttributes } from './types'

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  class InactiveSite extends Model<InactiveSiteInterface, InactiveSiteCreateInterface>{
    declare siteId: string
    declare uuid: string
    declare createdBy: string
    declare createdAt: string
    declare updatedBy: string
    declare updatedAt: string

    static associate({ Site }: { Site: ModelStatic<Model<SiteInterface, SiteCreationAttributes>> }) {
      this.belongsTo(Site, { targetKey: 'siteId', foreignKey: 'siteId' })
    }

    toJSON() {
      return { ...this.get(), id: undefined }
    } 
  }

  InactiveSite.init({
    siteId: {
      type: dataTypes.STRING,
      allowNull: false
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
    tableName: 'inactive_site',
    modelName: 'InactiveSite',
  })

  return InactiveSite
}