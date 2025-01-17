// Types
import { ModelStatic, Sequelize, Model } from 'sequelize'
import { Optional } from "sequelize"
import { BaseInterface } from "../types"

export interface ApprovalInterface extends BaseInterface {
  date: Date | string
  approvedBy: "FPMC" | "Admin" | "BOMA"
  parentId: string
}

export interface ApprovalCreationAttributes extends Optional<ApprovalInterface, 'uuid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>{}

export interface MilestoneExtensionInterface extends BaseInterface {
  date: Date | string
  parentId: string
}

export interface MilestoneExtensionCreationAttributes extends Optional<MilestoneExtensionInterface, 'uuid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>{}

export interface MilestoneStatusInterface extends BaseInterface {
  achieved: boolean | null
  expired: boolean | null
  parentId: string
}

export interface MilestoneStatusCreationAttributes extends Optional<MilestoneStatusInterface, 'uuid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>{}

export interface VestingNotificationInterface extends BaseInterface {
  date: Date | string
  type: "Initial" | "Last Call" | "Lost Vesting"
  parentId: string
}

export interface VestingNotificationCreationAttributes extends Optional<VestingNotificationInterface, 'uuid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>{}

export interface ProjectInterface extends BaseInterface {
  type: "Development Plan" | "Preliminary Plat" | "Site Plan"
  name: string
  cof: number | null
  ordinance: Date | string | null
  expired: boolean | null
  notes: string | null
}

export interface ProjectCreationAttributes extends Optional<ProjectInterface, 'uuid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>{}

export interface ResolutionInterface extends BaseInterface {
  resolution: string
  parentId: string
}

export interface ResolutionCreationAttributes extends Optional<ResolutionInterface, 'uuid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>{}

export interface VestingExtensionInterface extends BaseInterface {
  date: Date | string
  parentId: string
}

export interface VestingExtensionCreationAttributes extends Optional<VestingExtensionInterface, 'uuid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>{}

export interface MilestoneInterface extends BaseInterface {
  number: 1 | 2
  date: Date | string
  parentId: string
}

export interface MilestoneCreationAttributes extends Optional<MilestoneInterface, 'uuid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>{}

export interface VestingPeriodInterface extends BaseInterface {
  type: "10Y" | "15Y"
  date: Date | string
  parentId: string
}

export interface VestingPeriodCreationAttributes extends Optional<VestingPeriodInterface, 'uuid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>{}

export interface VestingStatusInterface extends BaseInterface {
  achieved: boolean | null
  expired: boolean | null
  parentId: string
}

export interface VestingStatusCreationAttributes extends Optional<VestingExtensionInterface, 'uuid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>{}

export interface DatabaseInterface {
  sequelize: Sequelize
  Approval: ModelStatic<Model<ApprovalInterface, ApprovalCreationAttributes>>
  MilestoneExtension: ModelStatic<Model<MilestoneExtensionInterface, MilestoneExtensionCreationAttributes>>
  MilestoneStatus: ModelStatic<Model<MilestoneStatusInterface, MilestoneStatusCreationAttributes>>
  Notification: ModelStatic<Model<VestingNotificationInterface, VestingNotificationCreationAttributes>>
  Project: ModelStatic<Model<ProjectInterface, ProjectCreationAttributes>>
  Resolution: ModelStatic<Model<ResolutionInterface, ResolutionCreationAttributes>>
  VestingExtension: ModelStatic<Model<VestingExtensionInterface, VestingExtensionCreationAttributes>>
  Milestone: ModelStatic<Model<MilestoneInterface, MilestoneCreationAttributes>>
  VestingPeriod: ModelStatic<Model<VestingPeriodInterface, VestingPeriodCreationAttributes>>
  VestingStatus: ModelStatic<Model<VestingStatusInterface, VestingStatusCreationAttributes>>
}

export interface ModelWithAssociate extends ModelStatic<Model> {
  associate: (db: DatabaseInterface) => void
}