'use strict'

// Types
import { Sequelize, Model, DataTypes, ModelStatic } from "sequelize"
import { RespondentInterface, RespondentCreationAttributes, PetitionInterface, PetitionCreationAttributes, ResponseInterface, ResponseCreationAttributes } from './types'

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  class Respondent extends Model<RespondentInterface, RespondentCreationAttributes>{
    declare name: string | null
    declare address: string
    declare ownerAddress: string | null
    declare ownerCity: string | null
    declare ownerState: string | null
    declare ownerZIP: string | null
    declare shortId: string
    declare parentId: string
    declare uuid: string
    declare createdBy: string
    declare createdAt: Date
    declare updatedBy: string
    declare updatedAt: Date

    static associate({ Petition, Response }: { Petition: ModelStatic<Model<PetitionInterface, PetitionCreationAttributes>>, Response: ModelStatic<Model<ResponseInterface, ResponseCreationAttributes>> }) {
      this.belongsTo(Petition, { targetKey: 'uuid', foreignKey: 'parentId'  }),
      this.hasOne(Response, { sourceKey: 'uuid', foreignKey: 'parentId' })
    }

    toJSON() {
      return { ...this.get(), id: undefined }
    }
  }

  Respondent.init({
    name: {
      type: DataTypes.STRING
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ownerAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ownerCity: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ownerState: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ownerZIP: {
      type: DataTypes.STRING,
      allowNull: true
    },
    shortId: {
      type: DataTypes.STRING
    },
    parentId: {
      type: DataTypes.UUID
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
    tableName: 'respondent',
    modelName: 'Respondent',
  })

  return Respondent
}