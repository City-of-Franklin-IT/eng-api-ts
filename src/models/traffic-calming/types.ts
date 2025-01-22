// Types
import { ModelStatic, Sequelize, Model } from 'sequelize'
import { Optional } from "sequelize"
import { BaseInterface } from "../types"

export interface PetitionInterface extends BaseInterface {
  petitionId: string
  description: string
  startDate: Date | string | null
  endDate: Date | string | null
}

export interface PetitionCreationAttributes extends Optional<PetitionInterface, 'petitionId' | 'uuid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>{}

export interface AttachmentInterface extends BaseInterface {
  parentId: string
  data: Blob
  fileType: "pdf" | "jpeg"
}

export interface AttachmentCreationAttributes extends Optional<AttachmentInterface, 'uuid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>{}

export interface RespondentInterface extends BaseInterface {
  name: string | null
  address: string
  ownerAddress: string | null
  ownerCity: string | null
  ownerState: string | null
  ownerZIP: string | null
  shortId: string
  parentId: string
  Response?: ResponseInterface
}

export interface RespondentCreationAttributes extends Optional<RespondentInterface, 'shortId' | 'uuid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>{}

export interface ResponseInterface {
  response: boolean
  parentId: string
  uuid: string
  createdAt: Date
  updatedAt: Date
}

export interface ResponseCreationAttributes extends Optional<ResponseInterface, 'uuid' | 'createdAt' | 'updatedAt'>{}

export interface DatabaseInterface {
  sequelize: Sequelize
  Petition: ModelStatic<Model<PetitionInterface, PetitionCreationAttributes>>
  Attachment: ModelStatic<Model<AttachmentInterface, AttachmentCreationAttributes>>
  Respondent: ModelStatic<Model<RespondentInterface, RespondentCreationAttributes>>
  Response: ModelStatic<Model<ResponseInterface, ResponseCreationAttributes>>
  [key: string]: ModelStatic<Model> | Sequelize
}

export interface ModelWithAssociate extends ModelStatic<Model> {
  associate: (db: DatabaseInterface) => void
}