import { Router } from 'express'
import { createComplaint, getComplaints, getComplaint, updateComplaint, deleteComplaint } from '@controllers/stormwater/complaint'
import { entra } from '@middleware/auth'

const router = Router()

router.use(entra)

router
  .route('/')
  .get(getComplaints)
  .post(createComplaint)

router
  .route('/:uuid')
  .get(getComplaint)
  .put(updateComplaint)
  .delete(deleteComplaint)

export default router