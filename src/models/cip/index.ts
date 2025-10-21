import moment from 'moment'
import dotenv from 'dotenv'
dotenv.config({ path: 'config/config.env' })

// Types
import { DataTypes, Model, ModelStatic, Sequelize } from 'sequelize'
import ProjectModel from './Project'
import MilestoneModel from './Milestone'
import PhaseModel from './Phase'
import SpendingModel from './Spending'
import UpdateModel from './Update'
import { ConfigInterface, DBPathInterface } from '../types'
import { DatabaseInterface, ProjectInterface, MilestoneInterface, PhaseInterface, SpendingInterface, UpdateInterface, ModelWithAssociate } from './types'

const env = process.env.NODE_ENV || 'development'

import config from '../../config/config'

const cfg = config as ConfigInterface

const db = {
  sequelize: {} as Sequelize,
  Project: {} as ModelStatic<Model<ProjectInterface>>,
  Milestone: {} as ModelStatic<Model<MilestoneInterface>>,
  Phase: {} as ModelStatic<Model<PhaseInterface>>,
  Spending: {} as ModelStatic<Model<SpendingInterface>>,
  Update: {} as ModelStatic<Model<UpdateInterface>>
} as DatabaseInterface

const dbPath: DBPathInterface = cfg[env].databases['cip']

db.sequelize = new Sequelize(dbPath.database, dbPath.username, dbPath.password, dbPath)

DataTypes.DATE.prototype._stringify = function _stringify(date: Date) { // Format DATE for MSSQL
  if(!date) return date
  
  const momentDate = moment.isMoment(date) ? date : moment(date)
  
  return momentDate.format('YYYY-MM-DD HH:mm:ss.SSS')
}

db.Project = ProjectModel(db.sequelize, DataTypes)
db.Milestone = MilestoneModel(db.sequelize, DataTypes)
db.Phase = PhaseModel(db.sequelize, DataTypes)
db.Spending = SpendingModel(db.sequelize, DataTypes)
db.Update = UpdateModel(db.sequelize, DataTypes)
  
Object.keys(db).forEach(modelName => {
  if((db[modelName] as ModelWithAssociate).associate) {
    (db[modelName] as ModelWithAssociate).associate(db)
  }
})

export const Project = db.Project
export const Milestone = db.Milestone
export const Phase = db.Phase
export const Spending = db.Spending
export const Update = db.Update