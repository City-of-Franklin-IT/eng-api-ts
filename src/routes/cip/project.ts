import { Router } from 'express'
import { getProjects, getProject, createProject, updateProject, deleteProject } from '@controllers/cip/project'
import { entra } from '@middleware/auth'
import { requireWrite } from '@utils/requireRole'

const router = Router()

router.use(entra)

router
  .route('/')
  .get(getProjects)
  .post(requireWrite("cip"), createProject)

router
  .route('/:uuid')
  .get(getProject)
  .put(requireWrite("cip"), updateProject)
  .delete(requireWrite("cip"), deleteProject)

export default router