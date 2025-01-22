import dotenv from 'dotenv'
dotenv.config({ path: 'config/config.env' })

// Types
import { Sequelize, Model, DataTypes, ModelStatic, } from 'sequelize'
import ApprovalModel from './Approval'
import MilestoneModel from './Milestone'
import MilestoneExtensionModel from './MilestoneExtension'
import MilestoneStatusModel from './MilestoneStatus'
import ProjectModel from './Project'
import ResolutionModel from './Resolution'
import VestingExtensionModel from './VestingExtension'
import VestingNotificationModel from './VestingNotification'
import VestingPeriodModel from './VestingPeriod'
import VestingStatusModel from './VestingStatus'
import { ConfigInterface, DBPathInterface } from '@models/types'
import { ApprovalInterface, ApprovalCreationAttributes, MilestoneInterface, MilestoneCreationAttributes, MilestoneExtensionInterface, MilestoneExtensionCreationAttributes, MilestoneStatusInterface, MilestoneStatusCreationAttributes, ProjectInterface, ProjectCreationAttributes, ResolutionInterface, ResolutionCreationAttributes, VestingExtensionInterface, VestingExtensionCreationAttributes, VestingNotificationInterface, VestingNotificationCreationAttributes, VestingPeriodInterface, VestingPeriodCreationAttributes, VestingStatusInterface, VestingStatusCreationAttributes, DatabaseInterface, ModelWithAssociate } from './types'

const env = process.env.NODE_ENV || 'development'

import config from '../../config/config'

const cfg = config as ConfigInterface

const db = {
  sequelize: {} as Sequelize,
  Approval: {} as ModelStatic<Model<ApprovalInterface, ApprovalCreationAttributes>>,
  Milestone: {} as ModelStatic<Model<MilestoneInterface, MilestoneCreationAttributes>>,
  MilestoneExtension: {} as ModelStatic<Model<MilestoneExtensionInterface, MilestoneExtensionCreationAttributes>>,
  MilestoneStatus: {} as ModelStatic<Model<MilestoneStatusInterface, MilestoneStatusCreationAttributes>>,
  Project: {} as ModelStatic<Model<ProjectInterface, ProjectCreationAttributes>>,
  Resolution: {} as ModelStatic<Model<ResolutionInterface, ResolutionCreationAttributes>>,
  VestingExtension: {} as ModelStatic<Model<VestingExtensionInterface, VestingExtensionCreationAttributes>>,
  VestingNotification: {} as ModelStatic<Model<VestingNotificationInterface, VestingNotificationCreationAttributes>>,
  VestingPeriod: {} as ModelStatic<Model<VestingPeriodInterface, VestingPeriodCreationAttributes>>,
  VestingStatus: {} as ModelStatic<Model<VestingStatusInterface, VestingStatusCreationAttributes>>
} as DatabaseInterface

const dbPath: DBPathInterface = cfg[env].databases['vesting']

db.sequelize = new Sequelize(dbPath.database, dbPath.username, dbPath.password, dbPath)

db.Approval = ApprovalModel(db.sequelize, DataTypes)
db.Milestone = MilestoneModel(db.sequelize, DataTypes)
db.MilestoneExtension = MilestoneExtensionModel(db.sequelize, DataTypes)
db.MilestoneStatus = MilestoneStatusModel(db.sequelize, DataTypes)
db.Project = ProjectModel(db.sequelize, DataTypes)
db.Resolution = ResolutionModel(db.sequelize, DataTypes)
db.VestingExtension = VestingExtensionModel(db.sequelize, DataTypes)
db.VestingNotification = VestingNotificationModel(db.sequelize, DataTypes)
db.VestingPeriod = VestingPeriodModel(db.sequelize, DataTypes)
db.VestingStatus = VestingStatusModel(db.sequelize, DataTypes)

Object.keys(db).forEach(modelName => {
  if((db[modelName] as ModelWithAssociate).associate) {
    (db[modelName] as ModelWithAssociate).associate(db)
  }
})

export const Approval = db.Approval
export const Milestone = db.Milestone
export const MilestoneExtension = db.MilestoneExtension
export const MilestoneStatus = db.MilestoneStatus
export const Project = db.Project
export const Resolution = db.Resolution
export const VestingExtension = db.VestingExtension
export const VestingNotification = db.VestingNotification
export const VestingPeriod = db.VestingPeriod
export const VestingStatus = db.VestingStatus