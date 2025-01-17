'use strict'

// Types
import { Sequelize, Model, DataTypes, ModelStatic } from "sequelize"
import { ResponseInterface, ResponseCreationAttributes, RespondentInterface, RespondentCreationAttributes } from './types'

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  class Response extends Model<ResponseInterface, ResponseCreationAttributes>{
    declare response: boolean
    declare parentId: string
    declare uuid: string
    declare createdAt: Date
    declare updatedAt: Date

    static associate({ Respondent }: { Respondent: ModelStatic<Model<RespondentInterface, RespondentCreationAttributes>> }) {
      this.belongsTo(Respondent, { targetKey: 'uuid', foreignKey: 'parentId' })
    }

    toJSON() {
      return { ...this.get(), id: undefined }
    }
  }

  Response.init({
    response: {
      type: DataTypes.NUMBER
    },
    parentId: {
      type: DataTypes.UUID
    },
    uuid: {
      type: dataTypes.UUID,
      allowNull: false,
      defaultValue: dataTypes.UUIDV4
    },
    createdAt: {
      type: dataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: dataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    freezeTableName: true,
    tableName: 'response',
    modelName: 'Response',
  });

  return Response
}