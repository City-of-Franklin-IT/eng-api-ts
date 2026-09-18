import { Router } from 'express'
import { createComplaint, getComplaints, getComplaint, updateComplaint, deleteComplaint } from '@controllers/stormwater/complaint'
import { entra } from '@middleware/auth'
import { requireWrite } from '@utils/requireRole'

const router = Router()

router.use(entra)

router
  .route('/')
  .get(getComplaints)
  .post(requireWrite("stormwater"), createComplaint)

router
  .route('/:uuid')
  .get(getComplaint)
  .put(requireWrite("stormwater"), updateComplaint)
  .delete(requireWrite("stormwater"), deleteComplaint)

export default router