'use strict';

// Types
import { Sequelize, Model, ModelStatic, DataTypes } from "sequelize"
import { PhaseInterface, PhaseCreationAttributes, ProjectInterface, ProjectCreationAttributes } from './types'

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {

  class Phase extends Model<PhaseInterface,PhaseCreationAttributes> {
    declare phase: string
    declare parentId: string
    declare uuid: string
    declare createdBy: string
    declare createdAt: Date
    declare updatedBy: string
    declare updatedAt: Date

    static associate({ Project }: { Project: ModelStatic<Model<ProjectInterface, ProjectCreationAttributes>> }) {
      this.hasOne(Project, { sourceKey: 'parentId', foreignKey: 'uuid' })
    }
    toJSON() {
      return { ...this.get(), id: undefined }
    }
  }

  Phase.init({
    phase: {
      type: dataTypes.STRING,
      allowNull: false
    },
    parentId: {
      type: dataTypes.UUID,
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
    modelName: 'Phase',
    tableName: 'phase'
  })
  
  return Phase
}