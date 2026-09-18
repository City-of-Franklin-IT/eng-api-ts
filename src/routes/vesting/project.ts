import { Router } from 'express'
import { getProjects, createProject, getProject, updateProject, deleteProject } from '@controllers/vesting/project'
import { entra } from '@middleware/auth'
import { requireWrite } from '@utils/requireRole'

const router = Router()

router
  .route('/')
  .get(getProjects)
  .post(entra, requireWrite("vesting"), createProject)

router
  .route('/:uuid')
  .get(getProject)
  .put(entra, requireWrite("vesting"), updateProject)
  .delete(entra, requireWrite("vesting"), deleteProject)

export default router