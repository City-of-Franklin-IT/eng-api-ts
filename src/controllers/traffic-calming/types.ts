// Types
import { Model } from "sequelize"
import { AttachmentInterface, PetitionInterface, RespondentInterface, ResponseInterface } from "@models/traffic-calming/types"
import { ControllerResponse } from "@controllers/types"
import { InforAddressInterface } from "@models/infor/types"

export interface CreateAttachmentRequest {
  parentId: string
  data: Blob
}

export interface DownloadAttachmentResponse {
  success: boolean
  data: Model<AttachmentInterface> & AttachmentInterface
}

export interface GetPetitionsResponse {
  success: boolean
  data: (Model<PetitionInterface> & PetitionInterface)[]
}

export interface GetPetitionResponse {
  success: boolean
  data: Model<PetitionInterface> & PetitionInterface
}

export interface CreatePetitionRequest {
  description: string
  startDate: string
  endDate: string
}

export interface CreatePetitionResponse extends ControllerResponse {
  data: Model<PetitionInterface> & PetitionInterface
}

export interface UpdatePetititonRequest {
  description: string
  startDate: string
  endDate: string
}

export interface CreateRespondentsRequest {
  name: string | null
  address: string
  ownerAddress: string | null
  ownerCity: string | null
  ownerState: string | null
  ownerZIP: string | null
  shortId: string
  parentId: string
}

export interface UpdateRespondentRequest {
  name: string | null
  address: string
  ownerAddress: string | null
  ownerCity: string | null
  ownerState: string | null
  ownerZIP: string | null
  shortId: string
}

export interface GetRespondentsResponse {
  success: boolean
  data: (Model<RespondentInterface> & RespondentInterface)[]
}

export interface VerifyRespondentResponse extends ControllerResponse {
  data?: Model<RespondentInterface>
}

export interface GetRespondentsByADDRKEYRequest {
  addrkeys: string[]
}

export interface GetRespondentsByADDRKEYResponse {
  success: boolean
  data: (Model<InforAddressInterface> & InforAddressInterface)[]
}

export interface CreateResponseRequest {
  response: boolean
  parentId: string
  shortId: string
}

export interface CreateResponseResponse extends ControllerResponse {
  data: Model<ResponseInterface>
}