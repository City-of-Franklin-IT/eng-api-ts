import dotenv from 'dotenv'
dotenv.config({ path: 'config/config.env' })

// Types
import { Sequelize, Model, DataTypes, ModelStatic } from 'sequelize'
import AttachmentModel from './Attachment'
import PetitionModel from './Petition'
import RespondentModel from './Respondent'
import ResponseModel from './Response'
import { ConfigInterface, DBPathInterface } from '@models/types'
import { AttachmentCreationAttributes, AttachmentInterface, PetitionCreationAttributes, PetitionInterface, RespondentCreationAttributes, RespondentInterface, ResponseCreationAttributes, ResponseInterface, DatabaseInterface, ModelWithAssociate } from './types'

const env = process.env.NODE_ENV || 'development'

import config from '../../config/config'

const cfg = config as ConfigInterface

const db = {
  sequelize: {} as Sequelize,
  Attachment: {} as ModelStatic<Model<AttachmentInterface, AttachmentCreationAttributes>>,
  Petition: {} as ModelStatic<Model<PetitionInterface, PetitionCreationAttributes>>,
  Respondent: {} as ModelStatic<Model<RespondentInterface, RespondentCreationAttributes>>,
  Response: {} as ModelStatic<Model<ResponseInterface, ResponseCreationAttributes>>
} as DatabaseInterface

const dbPath: DBPathInterface = cfg[env].databases['traffic-calming']

db.sequelize = new Sequelize(dbPath.database, dbPath.username, dbPath.password, dbPath)

db.Attachment = AttachmentModel(db.sequelize, DataTypes)
db.Petition = PetitionModel(db.sequelize, DataTypes)
db.Respondent = RespondentModel(db.sequelize, DataTypes)
db.Response = ResponseModel(db.sequelize, DataTypes)

Object.keys(db).forEach(modelName => {
  if((db[modelName] as ModelWithAssociate).associate) {
    (db[modelName] as ModelWithAssociate).associate(db)
  }
})

export const Attachment = db.Attachment
export const Petition = db.Petition
export const Respondent = db.Respondent
export const Response = db.Response