// Types
import { Model } from "sequelize"
import { AttachmentInterface, ComplaintInterface, ConstructionViolationInterface, ContactInterface, FollowUpDateInterface, GreenInfrastructureInterface, IllicitDischargeInterface, InspectorInterface, LogInterface, SiteContactInterface, SiteInterface } from "@models/stormwater/types"
import { ControllerResponse } from "@controllers/types"

export interface CreateAttachmentRequest {
  parentId: string
  data: Blob
}

export interface DownloadAttachmentResponse {
  success: boolean
  data: Model<AttachmentInterface> & AttachmentInterface
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
  data: Model<ComplaintInterface>[] & ComplaintInterface
}

export interface GetComplaintResponse {
  success: boolean
  data: Model<ComplaintInterface> & ComplaintInterface
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
}

export interface UpdateComplaintResponse extends ControllerResponse {
  data: Model<ComplaintInterface> & ComplaintInterface
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
  data: (Model<ConstructionViolationInterface> & ConstructionViolationInterface)[]
}

export interface GetConstructionViolationResponse {
  success: boolean
  data: Model<ConstructionViolationInterface> & ConstructionViolationInterface
}

export interface UpdateConstructionViolationRequest {
  date: string
  siteId: string
  details: string
  enforcementAction: string | null
  penaltyDate: string | null
  penaltyAmount: number | null
  penaltyDueDate: string | null
  paymentReceived: string | null
  swoDate: string | null
  swoLiftedDate: string | null
  compliance: boolean | null
  closed: boolean | null
}

export interface UpdateConstructionViolationResponse extends ControllerResponse {
  data: Model<ConstructionViolationInterface> & ConstructionViolationInterface
}

export interface CreateContactRequest {
  name: string
  phone: string | null
  company: string | null
  email: string | null
}

export interface CreateContactResponse extends ControllerResponse {
  data: Model<ContactInterface> & ContactInterface
}

export interface GetContactsResponse {
  success: boolean
  data: Model<ContactInterface>[] & ContactInterface
}

export interface GetContactResponse {
  success: boolean
  data: Model<ContactInterface> & ContactInterface
}

export interface UpdateContactRequest {
  name: string
  phone: string | null
  company: string | null
  email: string | null
  inactive: boolean | null
}

export interface UpdateContactResponse extends ControllerResponse {
  data: Model<ContactInterface> & ContactInterface
}

export interface CreateFollowUpDateRequest {
  parentId: string
  followUpDate: string
}

export interface CreateFollowUpDateResponse extends ControllerResponse {
  data: Model<FollowUpDateInterface> & FollowUpDateInterface
}

export interface UpdateFollowUpDateRequest {
  followUpDate: string
}

export interface UpdateFollowUpDateResponse extends ControllerResponse {
  data: Model<FollowUpDateInterface> & FollowUpDateInterface
}

export interface CreateIllicitDischargeRequest {
  complaintId: string | null
  siteId: string | null
  date: string
  xCoordinate: string
  yCoordinate: string
  locationDescription: string | null
  inspectorId: string | null
  details: string
  responsibleParty: string | null
  volumeLost: string | null
  streamWatershed: string
  otherStreamWatershed: string | null
  enforcementAction: string | null
  penaltyDate: string | null
  penaltyAmount: number | null
  penaltyDueDate: string | null
  paymentReceived: string | null
}

export interface CreateIllicitDischargeResponse extends ControllerResponse {
  data: Model<IllicitDischargeInterface>
}

export interface GetIllicitDischargesResponse {
  success: boolean
  data: (Model<IllicitDischargeInterface> & IllicitDischargeInterface)[]
}

export interface GetIllicitDischargeResponse {
  success: boolean
  data: Model<IllicitDischargeInterface>
}

export interface UpdateIllicitDischargeRequest {
  complaintId: string | null
  siteId: string | null
  date: string
  xCoordinate: string
  yCoordinate: string
  locationDescription: string | null
  inspectorId: string | null
  details: string
  responsibleParty: string | null
  volumeLost: string | null
  streamWatershed: string
  otherStreamWatershed: string | null
  enforcementAction: string | null
  penaltyDate: string | null
  penaltyAmount: number | null
  penaltyDueDate: string | null
  paymentReceived: string | null
  compliance: boolean | null
  closed: boolean | null
}

export interface UpdateIllicitDischargeResponse extends ControllerResponse {
  data: Model<IllicitDischargeInterface>
}

export interface CreateGreenInfrastructureRequest {
  date: string
  xCoordinate: string
  yCoordinate: string
  locationDescription: string | null
  inspectorId: string | null
  details: string
  comments: string | null
  responsibleParty: string | null
  enforcementAction: string | null
  penaltyDate: string | null
  penaltyAmount: number | null
  penaltyDueDate: string | null
  paymentReceived: string | null
}

export interface CreateGreenInfrastructureResponse extends ControllerResponse {
  data: Model<GreenInfrastructureInterface> & GreenInfrastructureInterface
}

export interface GetGreenInfrasturcturesResponse {
  success: boolean
  data: (Model<GreenInfrastructureInterface> & GreenInfrastructureInterface)[]
}

export interface GetGreenInfrasturctureResponse {
  success: boolean
  data: Model<GreenInfrastructureInterface> & GreenInfrastructureInterface
}

export interface UpdateGreenInfrastructureRequest {
  date: string
  xCoordinate: string
  yCoordinate: string
  locationDescription: string | null
  inspectorId: string | null
  details: string
  comments: string | null
  responsibleParty: string | null
  enforcementAction: string | null
  penaltyDate: string | null
  penaltyAmount: number | null
  penaltyDueDate: string | null
  paymentReceived: string | null
  bondReleased: boolean | null
  compliance: boolean | null
  closed: boolean | null
}

export interface UpdateGreenInfrastructureResponse extends ControllerResponse {
  data: Model<GreenInfrastructureInterface> & GreenInfrastructureInterface
}

export interface CreateInspectorRequest {
  name: string
  email: string
}

export interface CreateInspectorResponse extends ControllerResponse {
  data: Model<InspectorInterface> & InspectorInterface
}

export interface GetInspectorsResponse {
  success: boolean
  data: Model<InspectorInterface>[] & InspectorInterface
}

export interface GetInspectorResponse {
  success: boolean
  data: { sites: (Model<SiteInterface> & SiteInterface)[], inspector: Model<InspectorInterface> & InspectorInterface }
}

export interface UpdateInspectorRequest {
  name: string
  email: string
  inactive: boolean
}

export interface UpdateInspectorResponse extends ControllerResponse {
  data: Model<InspectorInterface> & InspectorInterface
}

export interface CreateLogRequest {
  siteId: string
  inspectionDate: string
}

export interface CreateLogResponse extends ControllerResponse {
  data: Model<LogInterface> & LogInterface
}

export interface GetLogResponse {
  success: boolean
  data: Model<LogInterface> & LogInterface
}

export interface UpdateLogRequest {
  inspectionDate: string
}

export interface UpdateLogResponse extends ControllerResponse {
  data: Model<LogInterface> & LogInterface
}

export interface CreateSiteContactRequest {
  siteId: string
  contactId: string
  isPrimary: boolean
  isContractor: boolean
  isInspector: boolean
}

export interface CreateSiteContactResponse extends ControllerResponse {
  data: Model<SiteContactInterface> & SiteContactInterface
}

export interface CreateSiteRequest {
  inspectorId: string | null
  name: string
  preconDate: string
  location: string
  xCoordinate: string
  yCoordinate: string
  permit: string
  cof: string
  tnq: string
  greenInfrastructure: boolean
}

export interface CreateSiteResponse extends ControllerResponse {
  data: Model<SiteInterface> & SiteInterface
}

export interface GetSitesResponse {
  success: boolean
  data: (Model<SiteInterface> & SiteInterface)[]
}

export interface GetSiteResponse {
  success: boolean
  data: Model<SiteInterface> & SiteInterface
}

export interface UpdateSiteRequest {
  inspectorId: string | null
  name: string
  location: string
  preconDate: string
  xCoordinate: string
  yCoordinate: string
  permit: string | null
  cof: string | null
  tnq: string | null
  greenInfrastructure: boolean
  inactive: boolean
}

export interface UpdateSiteResponse extends ControllerResponse {
  data: Model<SiteInterface> & SiteInterface
}

export interface GetActiveSitesResponse {
  success: boolean
  data: Model<SiteInterface>[] & SiteInterface
}