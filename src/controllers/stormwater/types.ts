// Types
import { Model } from "sequelize"
import { AttachmentInterface, AttachmentCreationAttributes, ComplaintInterface, ConstructionViolationInterface } from "@models/stormwater/types"
import { ControllerResponse } from "@controllers/types"

export interface CreateAttachmentRequest {
  parentId: string
  data: Blob
}

export interface DownloadAttachmentResponse {
  success: boolean
  data: Model<AttachmentInterface>
}

export interface CreateComplaintRequest {
  date: Date | string
  siteId: string | null
  inspectorId: string | null
  name: string | null
  address: string | null
  phone: string | null
  email: string | null
  xCoordinate: string | null
  yCoordinate: string | null
  locationDescription: string | null
  concern: string
  otherConcern: string | null
  details: string
  responsibleParty: string | null
  comments: string | null
}

export interface CreateComplaintResponse extends ControllerResponse {
  data: Model<ComplaintInterface> & ComplaintInterface
}

export interface GetComplaintsResponse {
  success: boolean
  data: Model<ComplaintInterface>[]
}

export interface GetComplaintResponse {
  success: boolean
  data: Model<ComplaintInterface>
}

export interface UpdateComplaintRequest {
  date: Date | string
  siteId: string | null
  inspectorId: string | null
  name: string | null
  address: string | null
  phone: string | null
  email: string | null
  xCoordinate: string | null
  yCoordinate: string | null
  locationDescription: string | null
  concern: string
  otherConcern: string | null
  details: string
  responsibleParty: string | null
  comments: string | null
  compliance: boolean | null
  closed: boolean | null
  readonly uuid: string
}

export interface UpdateComplaintResponse extends ControllerResponse {
  data: Model<ComplaintInterface>[] & ComplaintInterface
}

export interface CreateConstructionViolationRequest {
  date: string
  siteId: string
  details: string
  complaintId: string | null
}

export interface CreateConstructionViolationResponse extends ControllerResponse {
  data: Model<ConstructionViolationInterface> & ConstructionViolationInterface
}

export interface GetConstructionViolationsResponse {
  success: boolean
  data: Model<ConstructionViolationInterface>[] & ConstructionViolationInterface
}

export interface GetConstructionViolationResponse {
  success: boolean
  data: Model<ConstructionViolationInterface> & ConstructionViolationInterface
}