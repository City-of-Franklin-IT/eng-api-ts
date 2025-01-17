import dotenv from 'dotenv'
dotenv.config({ path: 'config/config.env' })

import { Sequelize, Model, DataTypes, ModelStatic } from 'sequelize'
import InforAddressModel from './InforAddress'
import { ConfigInterface, DBPathInterface } from '@models/types'
import { DatabaseInterface, InforAddressInterface } from './types'

const env = process.env.NODE_ENV || 'development'

import config from '../../config/config'

const cfg = config as ConfigInterface

const db = {
  sequelize: {} as Sequelize,
  InforAddress: {} as ModelStatic<Model<InforAddressInterface>>
} as DatabaseInterface

const dbPath: DBPathInterface = cfg[env].databases['infor']

db.sequelize = new Sequelize(dbPath.database, dbPath.username, dbPath.password, dbPath)

db.InforAddress = InforAddressModel(db.sequelize, DataTypes)

export const InforAddress = db.InforAddress