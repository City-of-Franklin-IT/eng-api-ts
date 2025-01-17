// Types
import { ProjectInterface } from "@models/cip/types"
import { ControllerResponse } from "@controllers/types"

export interface CreateMilestoneRequest {
  milestoneDesc: string
  milestoneEst: string | null
  milestoneRealized: string | null
  parentId: string
}

export interface UpdateProjectMilestoneRequest {
  milestoneDesc: string
  milestoneEst: string | null
  milestoneRealized: string | null
  readonly parentId: string
  readonly uuid: string
}

export interface CreatePhaseRequest {
  phase: string
  parentId: string
}

export interface GetProjectsResponse extends ControllerResponse {
  data: ProjectInterface[]
}

export interface GetProjectResponse extends ControllerResponse {
  data: ProjectInterface
}

export interface CreateProjectRequest {
  name: string
  projectDescription: string | null
  type: string
  manager: string | null
  managerEmail: string | null
  link: string | null
  approvedBudget: number
  archived: boolean | null
  xCoordinate: string
  yCoordinate: string
}

export interface CreateProjectResponse extends ControllerResponse {
  data: ProjectInterface
}

export interface PublicGetProjectsResponse extends ControllerResponse {
  data: ProjectInterface[]
}

export interface CreateSpendingRequest {
  dollarsSpent: number
  dollarsSpentDate: string
  parentId: string
}

export interface CreateProjectUpdateRequest {
  projectUpdate: string
  parentId: string
}

export interface UpdateProjectUpdateRequest {
  projectUpdate: string
  readonly parentId: string
  readonly uuid: string
}