// Types
import { Sequelize, Model, ModelStatic, Optional } from 'sequelize'
import { BaseInterface } from '@models/types'

export interface SiteInterface extends BaseInterface {
  siteId: string
  inspectorId: string | null
  name: string
  preconDate: string
  location: string
  xCoordinate: number
  yCoordinate: number
  permit: string | null
  cof: string | null
  tnq: string | null
  greenInfrastructure: boolean | null
  inactive: boolean
  hasOpenViolation?: boolean
  hasOpenComplaint?: boolean
  hasOpenIllicitDischarge?: boolean
  Logs?: LogInterface[]
  ConstructionViolations?: ConstructionViolationInterface[]
  Complaints?: ComplaintInterface[]
  IllicitDischarges?: IllicitDischargeInterface[]
  SiteContacts?: SiteContactInterface[]
  Inspector?: InspectorInterface
}

export interface SiteCreationAttributes extends Omit<SiteInterface, 'siteId' | 'inactive' | 'Logs' | 'ConstructionViolations' | 'Complaints' | 'IllicitDischarges' | 'SiteContacts' | 'Inspector' | 'uuid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>{
  siteId?: string
  inactive?: boolean
}

export interface ComplaintInterface extends BaseInterface {
  complaintId: string
  date: string
  siteId: string | null
  inspectorId: string | null
  name: string | null
  address: string | null
  phone: string | null
  email: string | null
  xCoordinate: number | null
  yCoordinate: number | null
  locationDescription: string | null
  concern: string
  otherConcern: string | null
  details: string
  responsibleParty: string | null
  comments: string | null
  compliance: boolean | null
  closed: boolean | null
  Inspector?: InspectorInterface
  FollowUpDates?: FollowUpDateInterface[]
}

export interface ComplaintCreationAttributes extends Omit<ComplaintInterface, 'Inspector' | 'FollowUpDates' | 'uuid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>{}

export interface ConstructionViolationInterface extends BaseInterface {
  violationId: string
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
  complaintId: string | null
  compliance: boolean | null
  closed: boolean | null
  FollowUpDates?: FollowUpDateInterface[]
}

export interface ConstructionViolationCreationAttributes extends Omit<ConstructionViolationInterface, 'FollowUpDates' | 'uuid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>{}

export interface ContactInterface extends BaseInterface {
  contactId: string
  name: string
  phone: string | null
  company: string | null
  email: string | null
  inactive: boolean
  SiteContacts?: SiteContactInterface[]
}

export interface ContactCreationAttributes extends Omit<ContactInterface, 'SiteContacts' | 'inactive' | 'uuid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>{
  inactive?: boolean
}

export interface FollowUpDateInterface extends BaseInterface {
  followUpId: string
  violationId: string | null
  complaintId: string | null
  illicitId: string | null
  greenId: string | null
  followUpDate: string
}

export interface FollowUpDateCreationAttributes extends Omit<FollowUpDateInterface, 'followUpId' |'uuid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>{
  followUpId?: string
  parentId?: string
}

export interface IllicitDischargeInterface extends BaseInterface {
  illicitId: string
  complaintId: string | null
  siteId: string | null
  date: string
  xCoordinate: number | null
  yCoordinate: number | null
  locationDescription: string | null
  inspectorId: string | null
  details: string
  responsibleParty: string | null
  volumeLost: string | null
  streamWatershed: string
  enforcementAction: string | null
  penaltyDate: string | null
  penaltyAmount: number | null
  penaltyDueDate: string | null
  paymentReceived: string | null
  compliance: boolean | null
  closed: boolean | null
  Inspector?: InspectorInterface
  FollowUpDates?: FollowUpDateInterface[]
}

export interface IllicitDischargeCreationAttributes extends Omit<IllicitDischargeInterface, 'illicitId' | 'Inspector' | 'FollowUpDates' | 'uuid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>{
  illicitId?: string
}

export interface InspectorInterface extends BaseInterface {
  inspectorId: string
  name: string
  email: string
  slug: string
  inactive: boolean
  Sites?: SiteInterface[]
  Complaints?: ComplaintInterface[]
  IllicitDischarges?: IllicitDischargeInterface[]
}

export interface InspectorCreationAttributes extends Omit<InspectorInterface, 'inspectorId' | 'slug' | 'inactive' | 'Sites' | 'Complaints' | 'IllicitDischarges' | 'uuid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>{
  inspectorId?: string
  slug?: string
  inactive?: boolean
}

export interface LogInterface extends BaseInterface {
  logId: string
  siteId: string
  inspectionDate: string
}

export interface LogCreationAttributes extends Omit<LogInterface, 'logId' | 'uuid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>{
  logId?: string
}

export interface SiteContactInterface extends BaseInterface {
  siteId: string
  contactId: string
  isPrimary: boolean
  isContractor: boolean
  isInspector: boolean
}

export interface SiteContactCreationAttributes extends Optional<SiteContactInterface, 'uuid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>{}

export interface DatabaseInterface {
  sequelize: Sequelize
  Complaint: ModelStatic<Model<ComplaintInterface, ComplaintCreationAttributes>>
  ConstructionViolation: ModelStatic<Model<ConstructionViolationInterface, ConstructionViolationCreationAttributes>>
  Contact: ModelStatic<Model<ContactInterface, ContactCreationAttributes>>
  FollowUpDate: ModelStatic<Model<FollowUpDateInterface, FollowUpDateCreationAttributes>>
  IllicitDischarge: ModelStatic<Model<IllicitDischargeInterface, IllicitDischargeCreationAttributes>>
  Inspector: ModelStatic<Model<InspectorInterface, InspectorCreationAttributes>>
  Log: ModelStatic<Model<LogInterface, LogCreationAttributes>>
  SiteContact: ModelStatic<Model<SiteContactInterface, SiteContactCreationAttributes>>
  Site: ModelStatic<Model<SiteInterface, SiteCreationAttributes>>
  [key: string]: ModelStatic<Model> | Sequelize
}

export interface ModelWithAssociate extends ModelStatic<Model> {
  associate: (db: DatabaseInterface) => void
}

export interface FileInterface extends File { // For attachments
  mimetype: string
  buffer: Buffer
}