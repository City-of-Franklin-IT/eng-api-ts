import { Router } from 'express'
import { getProjects, createProject, getProject, updateProject, deleteProject } from '@controllers/vesting/project'
import { protect } from '@middleware/auth'

const router = Router()

router.use(protect)

router
  .route('/')
  .get(getProjects)
  .post(protect, createProject)

router
  .route('/:uuid')
  .get(getProject)
  .put(protect, updateProject)
  .delete(protect, deleteProject)

export default router