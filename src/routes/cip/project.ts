import express from 'express'
import { getProjects, getProject, createProject, updateProject, deleteProject } from '@controllers/cip/project'
import { protect } from '@middleware/auth'

const router = express.Router()

router.use(protect)

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