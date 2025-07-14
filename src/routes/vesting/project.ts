import { Router } from 'express'
import { getProjects, createProject, getProject, updateProject, deleteProject } from '@controllers/vesting/project'
import { entra } from '@middleware/auth'

const router = Router()

router
  .route('/')
  .get(getProjects)
  .post(entra, createProject)

router
  .route('/:uuid')
  .get(getProject)
  .put(entra, updateProject)
  .delete(entra, deleteProject)

export default router