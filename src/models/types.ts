export interface BaseInterface {
  uuid: string
  createdBy: string | undefined
  createdAt: Date
  updatedBy: string | undefined
  updatedAt: Date
}

export interface ConfigInterface {
  [key: string]: any
}

export interface DBPathInterface {
  database: string
  username: string
  password: string
  dbPath: string
}