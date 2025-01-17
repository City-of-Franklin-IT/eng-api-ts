'use strict'

// Types
import { Sequelize, Model, DataTypes, ModelStatic } from "sequelize"
import { PetitionInterface, PetitionCreationAttributes, RespondentInterface, RespondentCreationAttributes, AttachmentInterface, AttachmentCreationAttributes } from './types'

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  class Petition extends Model<PetitionInterface, PetitionCreationAttributes>{
    declare petitionId: string
    declare description: string
    declare startDate: Date | string | null
    declare endDate: Date | string | null
    declare uuid: string
    declare createdBy: string
    declare createdAt: Date
    declare updatedBy: string
    declare updatedAt: Date

    static associate({ Respondent, Attachment }: { Respondent: ModelStatic<Model<RespondentInterface, RespondentCreationAttributes>>, Attachment: ModelStatic<Model<AttachmentInterface, AttachmentCreationAttributes>> }) {
      this.hasMany(Respondent, { sourceKey: 'uuid', foreignKey: 'parentId' })
      this.hasOne(Attachment, { sourceKey: 'uuid', foreignKey: 'parentId' })
    }

    toJSON() {
      return { ...this.get(), id: undefined }
    }
  }

  Petition.init({
    petitionId: {
      type: DataTypes.STRING
    },
    description: {
      type:  DataTypes.TEXT
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
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
    freezeTableName: true,
    tableName: 'petition',
    modelName: 'Petition'
  })

  return Petition
}