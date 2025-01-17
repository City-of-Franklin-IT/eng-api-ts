'use strict';

// Types
import { Sequelize, Model, DataTypes } from "sequelize"
import { InforAddressInterface } from './types'

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {

  class InforAddress extends Model<InforAddressInterface> {
    declare name: string | null
    declare address: string | null
    declare ownerAddress: string | null
    declare ownerCity: string | null
    declare ownerState: string | null
    declare ownerZIP: string | null
    declare addrkey: string | null
  }

  InforAddress.init({
    name: {
      type: dataTypes.STRING,
    },
    address: {
      type: dataTypes.STRING,
    },
    ownerAddress: {
      type: dataTypes.STRING,
    },
    ownerCity: {
      type: dataTypes.STRING
    },
    ownerState: {
      type: dataTypes.STRING
    },
    ownerZIP: {
      type: dataTypes.STRING
    },
    addrkey: {
      type: dataTypes.STRING
    }
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'InforAddress',
    tableName: 'surveyData'
  })

  return InforAddress
}