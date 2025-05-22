import dotenv from 'dotenv'
dotenv.config({ path: 'config/config.env' })

// Types
import { Sequelize, Model, DataTypes, ModelStatic } from 'sequelize'
import ComplaintModel from './Complaint'
import ConstructionViolationModel from './ConstructionViolation'
import ContactModel from './Contact'
import FollowUpDateModel from './FollowUpDate'
import IllicitDischargeModel from './IllicitDischarge'
import InspectorModel from './Inspector'
import LogModel from './Log'
import SiteModel from './Site'
import SiteContactModel from './SiteContact'
import { ConfigInterface, DBPathInterface } from '@models/types'
import * as Types from './types'

const env = process.env.NODE_ENV || 'development'

import config from '../../config/config'

const cfg = config as ConfigInterface

const db = {
  sequelize: {} as Sequelize,
  Complaint: {} as ModelStatic<Model<Types.ComplaintInterface, Types.ComplaintCreationAttributes>>,
  ConstructionViolation: {} as ModelStatic<Model<Types.ConstructionViolationInterface, Types.ConstructionViolationCreationAttributes>>,
  Contact: {} as ModelStatic<Model<Types.ContactInterface, Types.ContactCreationAttributes>>,
  FollowUpDate: {} as ModelStatic<Model<Types.FollowUpDateInterface, Types.FollowUpDateCreationAttributes>>,
  IllicitDischarge: {} as ModelStatic<Model<Types.IllicitDischargeInterface, Types.IllicitDischargeCreationAttributes>>,
  Inspector: {} as ModelStatic<Model<Types.InspectorInterface, Types.InspectorCreationAttributes>>,
  Log: {} as ModelStatic<Model<Types.LogInterface, Types.LogCreationAttributes>>,
  Site: {} as ModelStatic<Model<Types.SiteInterface, Types.SiteCreationAttributes>>,
  SiteContact: {} as ModelStatic<Model<Types.SiteContactInterface, Types.SiteContactCreationAttributes>>
} as Types.DatabaseInterface

const dbPath: DBPathInterface = cfg[env].databases['stormwater']

db.sequelize = new Sequelize(dbPath.database, dbPath.username, dbPath.password, dbPath)

db.Complaint = ComplaintModel(db.sequelize, DataTypes)
db.ConstructionViolation = ConstructionViolationModel(db.sequelize, DataTypes)
db.Contact = ContactModel(db.sequelize, DataTypes)
db.FollowUpDate = FollowUpDateModel(db.sequelize, DataTypes)
db.IllicitDischarge = IllicitDischargeModel(db.sequelize, DataTypes)
db.Inspector = InspectorModel(db.sequelize, DataTypes)
db.Log = LogModel(db.sequelize, DataTypes)
db.Site = SiteModel(db.sequelize, DataTypes)
db.SiteContact = SiteContactModel(db.sequelize, DataTypes)

Object.keys(db).forEach(modelName => {
  if((db[modelName] as Types.ModelWithAssociate).associate) {
    (db[modelName] as Types.ModelWithAssociate).associate(db)
  }
})

export const Complaint = db.Complaint
export const ConstructionViolation = db.ConstructionViolation
export const Contact = db.Contact
export const FollowUpDate = db.FollowUpDate
export const IllicitDischarge = db.IllicitDischarge
export const Inspector = db.Inspector
export const Log = db.Log
export const Site = db.Site
export const SiteContact = db.SiteContact