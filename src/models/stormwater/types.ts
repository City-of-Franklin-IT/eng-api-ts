// Types
import { Sequelize, Model, ModelStatic, Optional } from 'sequelize'
import { BaseInterface } from '@models/types'

export interface AttachmentInterface extends BaseInterface {
  parentId: string
  data: Blob
  fileType: string
}

export interface AttachmentCreationAttributes extends Optional<AttachmentInterface, 'fileType' | 'uuid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>{}

export interface ComplaintInterface extends BaseInterface {
  complaintId: string
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

export interface ComplaintCreationAttributes extends Optional<ComplaintInterface, 'complaintId' | 'uuid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>{}

export interface ConstructionViolationInterface extends BaseInterface {
  violationId: string
  date: Date | string
  siteId: string
  details: string
  enforcementAction: string | null
  penaltyDate: Date | string | null
  penaltyAmount: number | null
  penaltyDueDate: Date | string | null
  paymentReceived: Date | string | null
  swoDate: Date | string | null
  swoLiftedDate: Date | string | null
  complaintId: string
  compliance: boolean | null
  closed: boolean | null
}

export interface ConstructionViolationCreationAttributes extends Optional<ConstructionViolationInterface, 'violationId' | 'uuid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>{}

export interface ContactInterface extends BaseInterface {
  contactId: string
  name: string
  phone: string | null
  company: string | null
  email: string | null
  inactive: boolean | null
}

export interface ContactCreationAttributes extends Optional<ContactInterface, 'contactId' | 'uuid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>{}

export interface FollowUpDateInterface extends BaseInterface {
  followUpId: string
  violationId: string | null
  complaintId: string | null
  illicitId: string | null
  greenId: string | null
  followUpDate: Date | string
}

export interface FollowUpDateCreationAttributes extends Optional<FollowUpDateInterface, 'followUpId' |'uuid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>{}

export interface GreenInfrastructureInterface extends BaseInterface {
  greenId: string
  date: Date | string
  xCoordinate: string
  yCoordinate: string
  locationDescription: string | null
  inspectorId: string | null
  details: string
  comments: string | null
  responsibleParty: string | null
  enforcementAction: string | null
  penaltyDate: Date | string | null
  penaltyAmount: number | null
  penaltyDueDate: Date | string | null
  paymentReceived: Date | string | null
  bondReleased: boolean | null
  compliance: boolean | null
  closed: boolean | null
}

export interface GreenInfrastructureCreationAttributes extends Optional<GreenInfrastructureInterface, 'greenId' | 'uuid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>{}

export interface IllicitDischargeInterface extends BaseInterface {
  illicitId: string
  complaintId: string | null
  siteId: string | null
  date: Date | string
  xCoordinate: string
  yCoordinate: string
  locationDescription: string | null
  inspectorId: string | null
  details: string
  responsibleParty: string | null
  volumeLost: string | null
  streamWatershed: string
  enforcementAction: string | null
  penaltyDate: Date | string | null
  penaltyAmount: number | null
  penaltyDueDate: Date | string | null
  paymentReceived: Date | string | null
  compliance: boolean | null
  closed: boolean | null
}

export interface IllicitDischargeCreationAttributes extends Optional<IllicitDischargeInterface, 'illicitId' | 'uuid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>{}

export interface InspectorInterface extends BaseInterface {
  inspectorId: string
  name: string
  email: string
  slug: string
  inactive: boolean | null
}

export interface InspectorCreationAttributes extends Optional<InspectorInterface, 'inspectorId' | 'slug' | 'uuid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>{}

export interface LogInterface extends BaseInterface {
  logId: string
  siteId: string
  inspectionDate: Date | string
}

export interface LogCreationAttributes extends Optional<LogInterface, 'logId' | 'uuid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>{}

export interface SiteContactInterface extends BaseInterface {
  siteId: string
  contactId: string
  isPrimary: boolean
  isContractor: boolean
  isInspector: boolean
}

export interface SiteContactCreationAttributes extends Optional<SiteContactInterface, 'uuid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>{}

export interface SiteInterface extends BaseInterface {
  siteId: string
  inspectorId: string | null
  name: string
  preconDate: Date | string
  location: string
  xCoordinate: string
  yCoordinate: string
  permit: string | null
  cof: string | null
  tnq: string | null
  greenInfrastructure: number | null
  inactive: number
}

export interface SiteCreationAttributes extends Optional<SiteInterface, 'siteId' | 'uuid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>{}

export interface DatabaseInterface {
  sequelize: Sequelize
  Attachment: ModelStatic<Model<AttachmentInterface, AttachmentCreationAttributes>>
  Complaint: ModelStatic<Model<ComplaintInterface, ComplaintCreationAttributes>>
  ConstructionViolation: ModelStatic<Model<ConstructionViolationInterface, ConstructionViolationCreationAttributes>>
  Contact: ModelStatic<Model<ContactInterface, ContactCreationAttributes>>
  FollowUpDate: ModelStatic<Model<FollowUpDateInterface, FollowUpDateCreationAttributes>>
  GreenInfrastructure: ModelStatic<Model<GreenInfrastructureInterface, GreenInfrastructureCreationAttributes>>
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