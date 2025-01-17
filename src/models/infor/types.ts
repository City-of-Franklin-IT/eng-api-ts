// Types
import { Sequelize, Model, ModelStatic } from 'sequelize'

export interface InforAddressInterface {
  name: string | null
  address: string | null
  ownerAddress: string | null
  ownerCity: string | null
  ownerState: string | null
  ownerZIP: string | null
  addrkey: string | null
}

export interface DatabaseInterface {
  sequelize: Sequelize
  InforAddress: ModelStatic<Model<InforAddressInterface>>
}