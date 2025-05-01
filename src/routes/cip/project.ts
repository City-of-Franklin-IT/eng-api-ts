import { Router } from 'express'
import { getProjects, getProject, createProject, updateProject, deleteProject } from '@controllers/cip/project'
import { entra } from '@middleware/auth'

const router = Router()

router.use(entra)

router
  .route('/')
  .get(getProjects)
  .post(createProject)

router
  .route('/:uuid')
  .get(getProject)
  .put(updateProject)
  .delete(deleteProject)

export default router