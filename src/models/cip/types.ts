// Types
import { ModelStatic, Sequelize, Model } from 'sequelize'
import { Optional } from "sequelize"
import { BaseInterface } from "../types"

export interface MilestoneInterface extends BaseInterface {
  milestoneDesc: string
  milestoneEst: Date | null
  milestoneRealized: Date | null
  parentId: string
}

export interface MilestoneCreationAttributes extends Optional<MilestoneInterface, 'uuid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>{}

export interface ProjectInterface extends BaseInterface {
  projectId: number
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

export interface ProjectCreationAttributes extends Optional<ProjectInterface, 'projectId' | 'projectDescription' | 'manager' | 'managerEmail' | 'link' | 'archived' | 'uuid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>{}

export interface PhaseInterface extends BaseInterface {
  phase: string
  parentId: string
}

export interface PhaseCreationAttributes extends Optional<PhaseInterface, 'uuid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>{}

export interface SpendingInterface extends BaseInterface {
  dollarsSpent: number
  dollarsSpentDate: Date
  parentId: string
}

export interface SpendingCreationAttributes extends Optional<SpendingInterface, 'uuid' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>{}

export interface UpdateInterface extends BaseInterface {
  projectUpdate: string
  parentId: string
}

export interface UpdateCreationAttributes extends Optional<UpdateInterface, 'uuid' | 'createdAt' | 'updatedAt'>{}

export interface DatabaseInterface {
  sequelize: Sequelize
  Project: ModelStatic<Model<ProjectInterface, ProjectCreationAttributes>>
  Milestone: ModelStatic<Model<MilestoneInterface, MilestoneCreationAttributes>>
  Phase: ModelStatic<Model<PhaseInterface, PhaseCreationAttributes>>
  Spending: ModelStatic<Model<SpendingInterface, SpendingCreationAttributes>>
  Update: ModelStatic<Model<UpdateInterface, UpdateCreationAttributes>>
  [key: string]: ModelStatic<Model<any, any>> | Sequelize | { project: Sequelize, milestone: Sequelize, phase: Sequelize, spending: Sequelize, update: Sequelize }
}

export interface ModelWithAssociate extends ModelStatic<Model> {
  associate: (db: DatabaseInterface) => void
}