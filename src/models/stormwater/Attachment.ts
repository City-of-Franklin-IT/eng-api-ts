'use strict';

// Types
import { Sequelize, Model, DataTypes, ModelStatic } from "sequelize"
import { AttachmentInterface, AttachmentCreationAttributes, SiteInterface, SiteCreationAttributes } from './types'

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {

  class Attachment extends Model<AttachmentInterface,AttachmentCreationAttributes> {
    declare parentId: string
    declare data: Blob
    declare fileType: string
    declare uuid: string
    declare createdBy: string
    declare createdAt: Date
    declare updatedBy: string
    declare updatedAt: Date

    static associate({ Site }: { Site: ModelStatic<Model<SiteInterface, SiteCreationAttributes>> }) {
      this.belongsTo(Site, { targetKey: 'uuid', foreignKey: 'parentId' })
    }

    toJSON() {
      return { ...this.get(), id: undefined }
    }
  }

  Attachment.init({
    parentId: {
      type: dataTypes.STRING,
      allowNull: false
    },
    data: {
      type: dataTypes.BLOB,
      allowNull: false
    },
    fileType: {
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
  },{
    sequelize,
    tableName: 'attachments',
    modelName: 'Attachment',
  })

  return Attachment
}