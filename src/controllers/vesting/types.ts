// Types
import { Model } from "sequelize"
import { ControllerResponse } from "@controllers/types"
import { MilestoneExtensionInterface } from "@models/vesting/types"

export interface CreateApprovalRequest {
  date: string
  approvedBy: "FPMC" | "Admin" | "BOMA"
  parentId: string
}

export interface UpdateApprovalRequest {
  date: string
  approvedBy: "FPMC" | "Admin" | "BOMA"
}

export interface CreateMilestoneExtensionRequest {
  date: string
  parentId: string
}

export interface UpdateExtensionRequest {
  date: string
}

export interface UpdateExtensionResponse extends ControllerResponse {
  data: Model<MilestoneExtensionInterface> & MilestoneExtensionInterface
}

export interface CreateMilestoneRequest {
  number: 1 | 2
  date: string
  parentId: string
}

export interface UpdateMilestoneRequest {
  date: string
}

export interface UpdateMilestoneStatusRequest {
  achieved: boolean | null
  expired: boolean | null
}

export interface CreateNotificationRequest {
  date: string
  type: 'Initial' | 'Last Call' | 'Lost Vesting'
  parentId: string
}

export interface UpdateNotificationRequest {
  date: string
}

export interface CreateVestingPeriodRequest {
  type: "10Y" | "15Y"
  date: string
  parentId: string
}

export interface UpdateVestingPeriodRequest {
  type: "10Y" | "15Y"
  date: string
}

export interface UpdateVestingStatusRequest {
  achieved: boolean | null
  expired: boolean | null
}