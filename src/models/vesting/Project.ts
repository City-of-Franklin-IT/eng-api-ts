'use strict'

// Types
import { Sequelize, Model, DataTypes, ModelStatic } from "sequelize"
import { ProjectInterface, ProjectCreationAttributes, ApprovalInterface, ApprovalCreationAttributes, MilestoneInterface, MilestoneCreationAttributes, VestingNotificationInterface, VestingNotificationCreationAttributes, ResolutionInterface, ResolutionCreationAttributes, VestingPeriodInterface, VestingPeriodCreationAttributes } from './types'
import handleDateOnly from '@utils/handleDateOnly'

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  class Project extends Model<ProjectInterface, ProjectCreationAttributes>{
    declare type: "Development Plan" | "Preliminary Plat" | "Site Plan"
    declare name: string
    declare cof: number | null
    declare ordinance: Date | string | null
    declare expired: boolean | null
    declare notes: string | null
    declare uuid: string
    declare createdBy: string
    declare createdAt: Date
    declare updatedBy: string
    declare updatedAt: Date

    static associate({ Approval, Milestone, VestingNotification, Resolution, VestingPeriod }: { Approval: ModelStatic<Model<ApprovalInterface, ApprovalCreationAttributes>>, Milestone: ModelStatic<Model<MilestoneInterface, MilestoneCreationAttributes>>, VestingNotification: ModelStatic<Model<VestingNotificationInterface, VestingNotificationCreationAttributes>>, Resolution: ModelStatic<Model<ResolutionInterface, ResolutionCreationAttributes>>, VestingPeriod: ModelStatic<Model<VestingPeriodInterface, VestingPeriodCreationAttributes>> }) {
      this.hasMany(Approval, { sourceKey: 'uuid', foreignKey: 'parentId' }),
      this.hasMany(Milestone, { sourceKey: 'uuid', foreignKey: 'parentId' }),
      this.hasMany(VestingNotification, { sourceKey: 'uuid', foreignKey: 'parentId' }),
      this.hasOne(Resolution, { sourceKey: 'uuid', foreignKey: 'parentId' }),
      this.hasMany(VestingPeriod, { sourceKey: 'uuid', foreignKey: 'parentId' })
    }

    toJSON() {
      return { ...this.get(), id: undefined }
    }
  }

  Project.init({
    type: {
      type: DataTypes.STRING
    },
    name: {
      type: DataTypes.STRING
    },
    cof: {
      type: DataTypes.NUMBER,
      allowNull: true
    },
    ordinance: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      get(this: Project) {
        return handleDateOnly(this.getDataValue('ordinance') as Date | string | null, 'YYYY-MM-DD')
      }
    },
    expired: {
      type: DataTypes.NUMBER,
      allowNull: true,
      get() {
        const value = this.getDataValue('expired')
        return value === null ? null : !!value
      }
    },
    notes: {
      type: DataTypes.TEXT,
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
    tableName: 'project',
    modelName: 'Project',
  })

  return Project
}