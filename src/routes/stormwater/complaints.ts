import { Router } from 'express'
import { createComplaint, getComplaints, getComplaint, updateComplaint, deleteComplaint } from '@controllers/stormwater/complaints'
import { protect } from '@middleware/auth'

const router = Router()

router.use(protect)

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